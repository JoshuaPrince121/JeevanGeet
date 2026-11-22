import { NextResponse } from 'next/server';

import { requireAdmin, reportApiError } from '../../../../lib/admin-api';
import { createSupabaseAdminClient } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export async function POST(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid image upload.' }, { status: 400 });
  }

  const file = form.get('file');
  const category = form.get('category');
  if (
    !(file instanceof File) ||
    (category !== 'content' && category !== 'products')
  ) {
    return NextResponse.json(
      { error: 'Choose a JPG, PNG, or WebP image.' },
      { status: 400 },
    );
  }
  const extension = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  if (!extension || file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: 'Images must be JPG, PNG, or WebP and no larger than 4 MB.' },
      { status: 400 },
    );
  }

  const path = `admin/${category}/${crypto.randomUUID()}.${extension}`;
  try {
    const client = createSupabaseAdminClient();
    const { error } = await client.storage
      .from('gospel-content')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;
    const { data } = client.storage.from('gospel-content').getPublicUrl(path);
    return NextResponse.json({ path, url: data.publicUrl });
  } catch (error) {
    return reportApiError('Could not upload this image.', error);
  }
}
