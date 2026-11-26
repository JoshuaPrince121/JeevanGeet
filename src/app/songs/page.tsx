import Link from 'next/link';
import { Search, X } from 'lucide-react';

import { fetchSongLanguages, fetchSongs } from '../../lib/song-repository';

export const dynamic = 'force-dynamic';

export default async function SongsDirectory({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; language?: string }>;
}) {
  const { q = '', language = '' } = await searchParams;
  const query = q.trim();
  const languages = await fetchSongLanguages();
  const selectedLanguage = languages.includes(language) ? language : '';
  const songs = await fetchSongs({ query, language: selectedLanguage });
  const songsByLanguage = new Map<string, typeof songs>();
  for (const song of songs) {
    const languageSongs = songsByLanguage.get(song.language) ?? [];
    languageSongs.push(song);
    songsByLanguage.set(song.language, languageSongs);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-neutral-950 transition-colors duration-300 dark:text-neutral-100 md:px-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <p className="mb-2 text-sm font-medium uppercase text-neutral-500 dark:text-neutral-400">
            Jeevan Geet · Lyrics
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            {query ? `Results for “${query}”` : 'Songbook'}
          </h1>
        </div>
        <Link
          href="/songs/favorites"
          className="text-sm font-semibold text-neutral-700 underline decoration-neutral-400 underline-offset-4 hover:text-black dark:text-neutral-300 dark:hover:text-white"
        >
          Saved songs
        </Link>
      </header>

      <form action="/songs" method="GET" className="mb-10 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search title, number, or lyrics</span>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search title, number, or lyrics"
            className="w-full rounded-md border border-neutral-300 bg-white py-3 pl-10 pr-3 text-neutral-950 outline-none transition focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300 dark:focus:ring-neutral-700"
          />
        </label>
        <label>
          <span className="sr-only">Filter by language</span>
          <select
            name="language"
            defaultValue={selectedLanguage}
            className="h-full min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-neutral-950 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300 dark:focus:ring-neutral-700"
          >
            <option value="">All languages</option>
            {languages.map((songLanguage) => (
              <option key={songLanguage} value={songLanguage}>
                {songLanguage}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-neutral-950 px-5 font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-300"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
        </button>
        {(query || selectedLanguage) && (
          <Link
            href="/songs"
            aria-label="Clear search and language filter"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <X aria-hidden="true" className="size-4" />
            Clear
          </Link>
        )}
      </form>

      {songs.length === 0 ? (
        <div className="border-y border-neutral-200 py-16 text-center dark:border-neutral-800">
          <p className="text-lg font-semibold">No songs found</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Try a different title, number, lyric, or language.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>
          {[...songsByLanguage.entries()].map(([songLanguage, languageSongs]) => (
            <section key={songLanguage} aria-labelledby={`language-${songLanguage}`}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <h2 id={`language-${songLanguage}`} className="text-xl font-bold">
                  {songLanguage}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Jump to a number
                </p>
              </div>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                {languageSongs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/songs/${song.id}`}
                    aria-label={`Song ${song.number}: ${song.title}`}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-sm font-semibold tabular-nums transition hover:bg-neutral-950 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-neutral-700 dark:hover:bg-white dark:hover:text-neutral-950 dark:focus-visible:outline-neutral-300"
                  >
                    {song.number}
                  </Link>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {languageSongs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/songs/${song.id}`}
                    className="group flex min-h-24 items-center gap-4 border-y border-neutral-200 px-3 py-4 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-900 dark:focus-visible:outline-neutral-300"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold tabular-nums text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      {song.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold group-hover:underline group-hover:underline-offset-4">
                        {song.title}
                      </span>
                      <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">
                        Read lyrics
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}