'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SongSummary = {
  id: string;
  number: number;
  title: string;
  language: string;
};

export default function FavoritesList() {
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadFavorites() {
      try {
        const savedIds = readFavorites();
        if (savedIds.length === 0) return;
        const response = await fetch('/api/songs', { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load songs.');
        const allSongs = (await response.json()) as SongSummary[];
        if (active) {
          setSongs(allSongs.filter((song) => savedIds.includes(song.id)));
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Could not load songs.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadFavorites();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <p className="py-10 text-neutral-500 dark:text-neutral-400">Loading saved songs…</p>;
  }
  if (error) {
    return <p role="alert" className="py-10 text-neutral-700 dark:text-neutral-300">{error}</p>;
  }
  if (songs.length === 0) {
    return (
      <div className="border-y border-neutral-200 py-12 dark:border-neutral-800">
        <p className="font-semibold">No saved songs yet</p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Save a song from its lyrics page and it will appear here on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {songs.map((song) => (
        <Link
          key={song.id}
          href={`/songs/${song.id}`}
          className="flex min-h-20 items-center gap-4 border-y border-neutral-200 px-3 py-4 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold tabular-nums dark:bg-neutral-800">
            {song.number}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{song.title}</span>
            <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">
              {song.language}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem('jg-favorite-song-ids') ?? '[]',
    );
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}