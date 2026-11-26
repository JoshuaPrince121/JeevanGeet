'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SongFilterForm({
  query,
  languages,
  selectedLanguage,
}: {
  query: string;
  languages: string[];
  selectedLanguage: string;
}) {
  const router = useRouter();

  function applyLanguage(form: HTMLFormElement | null) {
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();
    const searchQuery = String(formData.get('q') ?? '').trim();
    const language = String(formData.get('language') ?? '').trim();
    if (searchQuery) params.set('q', searchQuery);
    if (language) params.set('language', language);

    const queryString = params.toString();
    router.push(queryString ? `/songs?${queryString}` : '/songs');
  }

  return (
    <form
      action="/songs"
      method="GET"
      className="mb-10 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto_auto]"
    >
      <label className="relative block">
        <span className="sr-only">Search title, number, or lyrics</span>
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
        />
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
          onChange={(event) => applyLanguage(event.currentTarget.form)}
          className="h-full min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-neutral-950 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300 dark:focus:ring-neutral-700"
        >
          <option value="">All languages</option>
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
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
  );
}
