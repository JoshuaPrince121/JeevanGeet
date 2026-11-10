import Link from 'next/link';
import { prisma } from '../../lib/prisma';

export default async function SongsDirectory({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || '';

  // Fetch songs, filtering by title, lyrics, or number if there is a search query
  const songs = await prisma.song.findMany({
    where: query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { lyrics: { contains: query, mode: 'insensitive' } },
        { number: isNaN(parseInt(query)) ? undefined : parseInt(query) }
      ]
    } : {},
    orderBy: { number: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 transition-colors duration-300">
      
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        {query ? `Search Results for "${query}"` : 'All Songs'}
      </h1>

      {/* NEW SEARCH BAR */}
      <form action="/songs" method="GET" className="flex gap-2 mb-8">
        <input 
          type="text" 
          name="q"
          defaultValue={query}
          placeholder="Search by title, number, or lyrics..." 
          className="flex-grow px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          Search
        </button>
        {query && (
          <Link href="/songs" className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium flex items-center">
            Clear
          </Link>
        )}
      </form>
      
      {songs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No songs found. Add some from the Admin panel!</p>
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