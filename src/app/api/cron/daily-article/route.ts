import { timingSafeEqual } from 'node:crypto';

import { load } from 'cheerio';
import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '../../../../lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BTP_UPDATES_URL =
  'https://bibletruthpublishers.com/library-whats-new-updated/lwn1';
const BTP_HOST = 'bibletruthpublishers.com';
const ARTICLE_COUNT = 5;

type FeedArticle = {
  title: string;
  source_url: string;
  published_at: string;
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

    const { error: upsertError } = await supabase
      .from('gospel_content')
      .upsert(contentRows, { onConflict: 'source_url' });
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

    return NextResponse.json({
      success: true,
      articlesSynced: articles.length,
    });
  } catch (error) {
    console.error('Daily article sync failed:', error);
    return NextResponse.json(
      { error: 'Daily article sync failed. Check the function logs.' },
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
