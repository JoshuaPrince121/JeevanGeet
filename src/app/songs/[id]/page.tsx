import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function SongPage({ params }: { params: any }) {
  const song = await prisma.song.findUnique({ where: { id: params.id } });

  if (!song) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 transition-colors duration-300">
      
      {/* Back Button */}
      <Link href="/songs" className="text-blue-600 dark:text-blue-400 hover:underline mb-8 inline-block font-medium">
        &larr; Back to all songs
      </Link>
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-8">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2">
          {song.language} • Song #{song.number}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          {song.title}
        </h1>
      </div>

      {/* Lyrics Text */}
      <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-serif">
        {song.lyrics}
      </div>
      
    </div>
  );
}