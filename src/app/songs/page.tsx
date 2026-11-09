import Link from 'next/link';
import { prisma } from '../../lib/prisma';

export default async function SongsDirectory() {
  const songs = await prisma.song.findMany({
    orderBy: { number: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">All Songs</h1>
      
      {songs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-slate-200">
          <p className="text-slate-500">Database is currently empty. Go to the Admin page to add songs!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {songs.map((song) => (
            <Link 
              key={song.id} 
              href={`/songs/${song.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-slate-200"
            >
              <span className="text-sm font-bold text-blue-600 mr-2">
                #{song.number}
              </span>
              <span className="text-slate-800 font-medium">
                {song.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}