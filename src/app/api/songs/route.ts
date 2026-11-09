import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const songs = await prisma.song.findMany({ orderBy: { number: 'asc' } });
  return NextResponse.json(songs);
}

export async function POST(req: Request) {
  const data = await req.json();
  const song = await prisma.song.create({
    data: {
      number: parseInt(data.number),
      title: data.title,
      lyrics: data.lyrics,
      language: data.language,
    },
  });
  return NextResponse.json(song);
}