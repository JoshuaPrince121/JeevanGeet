import Link from 'next/link';
import { prisma } from '../../lib/prisma';

export default async function SongsDirectory({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || '';

  // Fetch songs, filtering by title, lyrics, or number if there is a search query
  const songs = await prisma.song.findMany({
    where: query ? {
      OR: [
        { title: { contains: query } },
        { lyrics: { contains: query } },
        { number: isNaN(parseInt(query)) ? undefined : parseInt(query) }
      ]
    } : {},
    orderBy: { number: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {query ? `Search Results for "${query}"` : 'All Songs'}
        </h1>
        {query && (
          <Link href="/songs" className="text-blue-600 dark:text-blue-400 hover:underline">
            Clear Search
          </Link>
        )}
      </div>
      
      {songs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No songs found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {songs.map((song) => (
            <Link 
              key={song.id} 
              href={`/songs/${song.id}`}
              className="block p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition border border-slate-200 dark:border-slate-700"
            >
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mr-2">
                #{song.number}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {song.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}