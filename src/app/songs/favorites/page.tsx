import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import FavoritesList from './favorites-list';

export default function FavoritesPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-8 text-neutral-950 dark:text-neutral-100 md:px-8 md:py-12">
      <Link
        href="/songs"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All songs
      </Link>
      <header className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <p className="mb-2 text-sm font-medium uppercase text-neutral-500 dark:text-neutral-400">
          Jeevan Geet · Lyrics
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">Saved songs</h1>
      </header>
      <FavoritesList />
    </main>
  );
}