import { NextResponse } from 'next/server';

import { requireAdmin, reportApiError } from '../../../../lib/admin-api';
import { createSupabaseAdminClient } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

type ProductInput = {
  id?: string;
  title: string;
  description: string;
  price_minor: number;
  image_path: string;
  is_published: boolean;
};

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from('shop_products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const items = data.map((item) => ({
      ...item,
      image_url: client.storage
        .from('gospel-content')
        .getPublicUrl(item.image_path).data.publicUrl,
    }));
    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return reportApiError('Could not load products.', error);
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
  if (!isProductInput(input)) {
    return NextResponse.json(
      { error: 'Complete the product title, description, price, and image.' },
      { status: 400 },
    );
  }

  const { id, ...fields } = input;
  const payload = {
    ...fields,
    currency: 'INR',
    updated_at: new Date().toISOString(),
  };
  try {
    const client = createSupabaseAdminClient();
    const result = id
      ? await client
          .from('shop_products')
          .update(payload)
          .eq('id', id)
          .select()
          .single()
      : await client.from('shop_products').insert(payload).select().single();
    if (result.error) throw result.error;
    return NextResponse.json(result.data);
  } catch (error) {
    return reportApiError('Could not save this product.', error);
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get('id');
  if (!id || id.length > 100) {
    return NextResponse.json({ error: 'A product ID is required.' }, { status: 400 });
  }
  try {
    const { error } = await createSupabaseAdminClient()
      .from('shop_products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return reportApiError('Could not delete this product.', error);
  }
}

function isProductInput(value: unknown): value is ProductInput {
  if (typeof value !== 'object' || value === null) return false;
  const input = value as Record<string, unknown>;
  return (
    (input.id === undefined ||
      (typeof input.id === 'string' && input.id.length <= 100)) &&
    isText(input.title, 1, 200) &&
    isText(input.description, 1, 10_000) &&
    typeof input.price_minor === 'number' &&
    Number.isSafeInteger(input.price_minor) &&
    input.price_minor >= 0 &&
    input.price_minor <= 100_000_000 &&
    typeof input.image_path === 'string' &&
    isText(input.image_path, 1, 500) &&
    input.image_path.startsWith('admin/products/') &&
    typeof input.is_published === 'boolean'
  );
}

function isText(value: unknown, minLength: number, maxLength: number) {
  return (
    typeof value === 'string' &&
    value.trim().length >= minLength &&
    value.length <= maxLength
  );
}
