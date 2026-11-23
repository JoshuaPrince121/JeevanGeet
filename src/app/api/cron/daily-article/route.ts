import { timingSafeEqual } from 'node:crypto';

import { load } from 'cheerio';
import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '../../../../lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BTP_UPDATES_URL =
  'https://bibletruthpublishers.com/library-whats-new-updated/lwn1';
const KJV_DAILY_URL =
  'https://bible-api.com/?random=verse&translation=kjv';
const BTP_HOST = 'bibletruthpublishers.com';
const ARTICLE_COUNT = 5;

type FeedArticle = {
  title: string;
  source_url: string;
  published_at: string;
};

type KJVResponse = {
  reference?: unknown;
  text?: unknown;
  translation_id?: unknown;
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Cron authorization is not configured.' },
      { status: 503 },
    );
  }
  if (!hasValidAuthorization(request, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const updatesHtml = await fetchText(BTP_UPDATES_URL);
    const articles = parseLatestArticles(updatesHtml).slice(0, ARTICLE_COUNT);
    if (articles.length !== ARTICLE_COUNT) {
      throw new Error(`Expected ${ARTICLE_COUNT} recent library links.`);
    }

    const supabase = createSupabaseAdminClient();
    const date = getIndiaDate();
    const { data: storedVerse, error: storedVerseError } = await supabase
      .from('daily_verse')
      .select('verse_text, verse_reference, source_url')
      .eq('date', date)
      .maybeSingle();
    if (storedVerseError) throw storedVerseError;
    const verse = storedVerse
      ? {
          text: storedVerse.verse_text,
          reference: storedVerse.verse_reference,
          source_url: storedVerse.source_url,
        }
      : await fetchKjvVerse();

    const contentRows = articles.map((article) => ({
      kind: 'article',
      title: article.title,
      category: 'Bible Truth Publishers',
      summary: 'Open this reading on the publisher’s website.',
      cover_path: '',
      body: 'This reading is hosted by Bible Truth Publishers. Use the button below to read the original.',
      testimony: null,
      is_published: true,
      published_at: article.published_at,
      updated_at: new Date().toISOString(),
      source_url: article.source_url,
    }));

    const { data: syncedArticles, error: upsertError } = await supabase
      .from('gospel_content')
      .upsert(contentRows, { onConflict: 'source_url' })
      .select('id, source_url');
    if (upsertError) throw upsertError;

    const currentUrls = new Set(articles.map((article) => article.source_url));
    const { data: existingFeedRows, error: listError } = await supabase
      .from('gospel_content')
      .select('source_url')
      .eq('kind', 'article')
      .like('source_url', `https://${BTP_HOST}/%`);
    if (listError) throw listError;

    const staleUrls = (existingFeedRows ?? [])
      .map((row) => row.source_url as string | null)
      .filter((url): url is string => url !== null && !currentUrls.has(url));
    if (staleUrls.length > 0) {
      const { error: deleteError } = await supabase
        .from('gospel_content')
        .delete()
        .eq('kind', 'article')
        .in('source_url', staleUrls);
      if (deleteError) throw deleteError;
    }

    const linkedArticle = syncedArticles?.find(
      (article) => article.source_url === articles[0].source_url,
    );
    if (!linkedArticle) throw new Error('Could not link the daily verse.');

    const { error: verseError } = await supabase.from('daily_verse').upsert(
      {
        date,
        verse_text: verse.text,
        verse_reference: verse.reference,
        source_url: verse.source_url,
        linked_article_id: linkedArticle.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'date' },
    );
    if (verseError) throw verseError;

    return NextResponse.json({
      success: true,
      articlesSynced: articles.length,
      verseReference: verse.reference,
      date,
    });
  } catch (error) {
    console.error('Daily content sync failed:', error);
    return NextResponse.json(
      { error: 'Daily content sync failed. Check the function logs.' },
      { status: 502 },
    );
  }
}

function hasValidAuthorization(request: Request, secret: string) {
  const supplied = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': 'JeevanGeetDailyFeed/1.0' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Source request failed (${response.status}).`);
  return response.text();
}

async function fetchKjvVerse() {
  const response = await fetch(KJV_DAILY_URL, {
    cache: 'no-store',
    headers: { 'User-Agent': 'JeevanGeetDailyFeed/1.0' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`KJV request failed (${response.status}).`);

  const result = (await response.json()) as KJVResponse;
  const reference = typeof result.reference === 'string'
    ? result.reference.trim()
    : '';
  const verseText = typeof result.text === 'string'
    ? result.text.replace(/\s+/g, ' ').trim()
    : '';
  if (
    result.translation_id !== 'kjv' ||
    reference.length === 0 ||
    verseText.length === 0
  ) {
    throw new Error('The KJV source returned an invalid verse.');
  }

  return {
    reference,
    text: verseText,
    source_url: `https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`,
  };
}

function parseLatestArticles(html: string): FeedArticle[] {
  const $ = load(html);
  const entries: FeedArticle[] = [];
  const seen = new Set<string>();

  $('[class~="web-new-date"]').each((_, dateElement) => {
    const dateText = $(dateElement).text().replace(/\s+/g, ' ').trim();
    const addedDate = dateText.match(
      /Added:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
    )?.[1];
    if (!addedDate) return;

    const titleLink = $(dateElement)
      .prevAll('.list-item')
      .first()
      .find('a[href]')
      .first();
    const title = titleLink.text().replace(/\s+/g, ' ').trim();
    const href = titleLink.attr('href');
    const sourceUrl = href && isPublisherUrl(href)
      ? new URL(href, BTP_UPDATES_URL).toString()
      : '';

    const publishedAt = new Date(`${addedDate} UTC`);
    if (
      !title ||
      title.length > 200 ||
      !sourceUrl ||
      Number.isNaN(publishedAt.getTime()) ||
      seen.has(sourceUrl)
    ) {
      return;
    }

    seen.add(sourceUrl);
    entries.push({
      title,
      source_url: sourceUrl,
      published_at: publishedAt.toISOString(),
    });
  });

  return entries.sort(
    (first, second) =>
      Date.parse(second.published_at) - Date.parse(first.published_at),
  );
}

function isPublisherUrl(href: string) {
  try {
    const url = new URL(href, BTP_UPDATES_URL);
    return url.protocol === 'https:' && url.hostname === BTP_HOST;
  } catch {
    return false;
  }
}

function getIndiaDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}