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
        
        <h1 className="text-5xl font-bold text-neutral-950 dark:text-white md:text-6xl">
          जीवन गीत <span className="mt-4 block text-2xl font-normal text-neutral-500 md:text-3xl">Jeevan Geet</span>
        </h1>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          A complete digital songbook. Browse, search, and read your favorite hymns.
        </p>
        
        {/* Real Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto pt-4">
          <input
            type="search"
            placeholder="Search songs by title, number, or lyrics..." 
            className="w-full rounded-md border border-neutral-300 bg-white px-6 py-4 text-lg text-neutral-950 shadow-sm outline-none transition focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300 dark:focus:ring-neutral-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/songs" className="rounded-md bg-neutral-950 px-8 py-4 text-lg font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-300">
            Browse All Songs
          </Link>
          <Link href="/donate" className="rounded-md border border-neutral-300 bg-white px-8 py-4 text-lg font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
            Support This Project
          </Link>
        </div>
      </div>
    </main>
  );
}