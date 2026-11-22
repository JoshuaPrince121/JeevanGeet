import { NextResponse } from 'next/server';

import { requireAdmin, reportApiError } from '../../../../lib/admin-api';
import { createSupabaseAdminClient } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

type ContentInput = {
  id?: string;
  kind: 'article' | 'ministry_report';
  title: string;
  category: string;
  summary: string;
  cover_path: string;
  body: string;
  testimony: string | null;
  is_published: boolean;
  published_at?: string | null;
};

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from('gospel_content')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const items = data.map((item) => ({
      ...item,
      cover_url: client.storage
        .from('gospel-content')
        .getPublicUrl(item.cover_path).data.publicUrl,
    }));
    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return reportApiError('Could not load articles and ministry reports.', error);
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!isContentInput(input)) {
    return NextResponse.json(
      { error: 'Complete all required article or report fields.' },
      { status: 400 },
    );
  }

  const { id, ...fields } = input;
  const payload = {
    ...fields,
    testimony: fields.kind === 'ministry_report' ? fields.testimony : null,
    published_at: fields.is_published
      ? fields.published_at ?? new Date().toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };
  try {
    const client = createSupabaseAdminClient();
    const result = id
      ? await client
          .from('gospel_content')
          .update(payload)
          .eq('id', id)
          .select()
          .single()
      : await client.from('gospel_content').insert(payload).select().single();
    if (result.error) throw result.error;
    return NextResponse.json(result.data);
  } catch (error) {
    return reportApiError('Could not save this article or report.', error);
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get('id');
  if (!id || id.length > 100) {
    return NextResponse.json(
      { error: 'A content ID is required.' },
      { status: 400 },
    );
  }
  try {
    const { error } = await createSupabaseAdminClient()
      .from('gospel_content')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return reportApiError('Could not delete this article or report.', error);
  }
}

function isContentInput(value: unknown): value is ContentInput {
  if (typeof value !== 'object' || value === null) return false;
  const input = value as Record<string, unknown>;
  return (
    (input.id === undefined ||
      (typeof input.id === 'string' && input.id.length <= 100)) &&
    (input.kind === 'article' || input.kind === 'ministry_report') &&
    isText(input.title, 1, 200) &&
    isText(input.category, 1, 100) &&
    isText(input.summary, 1, 1000) &&
    typeof input.cover_path === 'string' &&
    isText(input.cover_path, 1, 500) &&
    input.cover_path.startsWith('admin/content/') &&
    isText(input.body, 1, 100_000) &&
    (input.testimony === null || isText(input.testimony, 0, 20_000)) &&
    typeof input.is_published === 'boolean' &&
    (input.published_at === undefined ||
      input.published_at === null ||
      (typeof input.published_at === 'string' &&
        !Number.isNaN(Date.parse(input.published_at))))
  );
}

function isText(value: unknown, minLength: number, maxLength: number) {
  return (
    typeof value === 'string' &&
    value.trim().length >= minLength &&
    value.length <= maxLength
  );
}
