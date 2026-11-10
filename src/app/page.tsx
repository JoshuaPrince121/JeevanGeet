'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/songs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 transition-colors duration-300">
      <div className="max-w-3xl text-center space-y-8">
        
        <h1 className="text-5xl md:text-6xl font-bold text-blue-900 dark:text-blue-400">
          जीवन गीत <span className="text-2xl md:text-3xl block mt-4 text-slate-500 font-normal">Jeevan Geet</span>
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-300">
          A complete digital songbook. Browse, search, and read your favorite hymns.
        </p>
        
        {/* Real Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto pt-4">
          <input 
            type="text" 
            placeholder="Search songs by title, number, or lyrics..." 
            className="w-full px-6 py-4 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/songs" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg">
            Browse All Songs
          </Link>
          <Link href="/donate" className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-lg">
            Support This Project
          </Link>
        </div>
      </div>
    </main>
  );
}