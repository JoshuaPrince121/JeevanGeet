import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { isSameOriginRequest, isValidAdminSession } from '../../../lib/admin-auth';

export async function GET() {
  const songs = await prisma.song.findMany({ orderBy: { number: 'asc' } });
  return NextResponse.json(songs);
}

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  }
  if (!hasAdminSession(req)) {
    return NextResponse.json({ error: 'Sign in as admin.' }, { status: 401 });
  }

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!isSongInput(data)) {
    return NextResponse.json(
      { error: 'Provide a valid song number, title, lyrics, and language.' },
      { status: 400 },
    );
  }

  const song = await prisma.song.create({
    data: {
      number: Number(data.number),
      title: data.title,
      lyrics: data.lyrics,
      language: data.language,
    },
  });
  return NextResponse.json(song);
}

function hasAdminSession(request: Request) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('jg_admin_session='))
    ?.slice('jg_admin_session='.length);
  return isValidAdminSession(cookie);
}

function isSongInput(
  value: unknown,
): value is {
  number: string | number;
  title: string;
  lyrics: string;
  language: 'Hindi' | 'Bengali';
} {
  if (typeof value !== 'object' || value === null) return false;
  if (
    !('number' in value) ||
    !('title' in value) ||
    !('lyrics' in value) ||
    !('language' in value)
  ) {
    return false;
  }
  if (
    (typeof value.number !== 'string' && typeof value.number !== 'number') ||
    typeof value.title !== 'string' ||
    typeof value.lyrics !== 'string'
  ) {
    return false;
  }
  const number = Number(value.number);
  return (
    Number.isSafeInteger(number) &&
    number > 0 &&
    value.title.trim().length > 0 &&
    value.title.length <= 300 &&
    value.lyrics.trim().length > 0 &&
    value.lyrics.length <= 100_000 &&
    (value.language === 'Hindi' || value.language === 'Bengali')
  );
}