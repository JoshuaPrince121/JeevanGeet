'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Heart,
  Minus,
  Plus,
  Printer,
  Share2,
} from 'lucide-react';

export type ReaderSong = {
  id: string;
  number: number;
  title: string;
  lyrics: string;
  language: string;
};

const favoriteStorageKey = 'jg-favorite-song-ids';
const fontSizeStorageKey = 'jg-lyrics-font-size';
const fontSizes = [16, 18, 20, 24];

export default function SongReader({
  song,
  languageSongs,
  previousSong,
  nextSong,
}: {
  song: ReaderSong;
  languageSongs: ReaderSong[];
  previousSong: ReaderSong | null;
  nextSong: ReaderSong | null;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setIsFavorite(readFavorites().includes(song.id));
    const savedFontSize = Number(localStorage.getItem(fontSizeStorageKey));
    if (fontSizes.includes(savedFontSize)) setFontSize(savedFontSize);
  }, [song.id]);

  async function copyLyrics() {
    try {
      await navigator.clipboard.writeText(`${song.title}\n\n${song.lyrics}`);
      setNotice('Lyrics copied.');
    } catch {
      setNotice('Clipboard access is unavailable in this browser.');
    }
  }

  async function shareLyrics() {
    const text = `${song.title}\n\n${song.lyrics}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: song.title, text, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n\n${location.href}`);
      setNotice('Song link copied.');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setNotice('Could not share this song.');
      }
    }
  }

  function toggleFavorite() {
    const favorites = readFavorites();
    const updated = isFavorite
      ? favorites.filter((id) => id !== song.id)
      : [...favorites, song.id];
    localStorage.setItem(favoriteStorageKey, JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    setNotice(isFavorite ? 'Removed from saved songs.' : 'Song saved.');
  }

  function changeFontSize(direction: -1 | 1) {
    const currentIndex = fontSizes.indexOf(fontSize);
    const nextSize = fontSizes[
      Math.max(0, Math.min(fontSizes.length - 1, currentIndex + direction))
    ];
    setFontSize(nextSize);
    localStorage.setItem(fontSizeStorageKey, String(nextSize));
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 text-neutral-950 transition-colors dark:text-neutral-100 md:px-8 md:py-10">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/songs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All songs
        </Link>
        <div className="flex items-center gap-1" aria-label="Lyrics actions">
          <button
            aria-label={isFavorite ? 'Remove from saved songs' : 'Save song'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Remove from saved songs' : 'Save song'}
            onClick={toggleFavorite}
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Heart className="size-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            aria-label="Copy lyrics"
            title="Copy lyrics"
            onClick={copyLyrics}
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Copy aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label="Share song"
            title="Share song"
            onClick={shareLyrics}
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Share2 aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label="Print lyrics"
            title="Print lyrics"
            onClick={() => window.print()}
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Printer aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-3xl">
        <header className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <p className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            {song.language} <span aria-hidden="true">·</span> Song {song.number}
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{song.title}</h1>
        </header>

        <nav
          aria-label="Navigate songs by number"
          className="no-print my-5 flex items-center justify-between gap-3"
        >
          {previousSong ? (
            <Link
              href={`/songs/${previousSong.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Previous
            </Link>
          ) : <span />}
          <span className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
            {song.number} / {languageSongs.length}
          </span>
          {nextSong ? (
            <Link
              href={`/songs/${nextSong.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Next
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : <span />}
        </nav>

        <div className="no-print mb-6 flex items-center justify-between border-y border-neutral-200 py-3 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Text size
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Decrease lyrics text size"
              title="Decrease text size"
              disabled={fontSize === fontSizes[0]}
              onClick={() => changeFontSize(-1)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-300 disabled:opacity-40 dark:border-neutral-700"
            >
              <Minus aria-hidden="true" className="size-4" />
            </button>
            <span className="w-12 text-center text-sm tabular-nums">{fontSize}px</span>
            <button
              aria-label="Increase lyrics text size"
              title="Increase text size"
              disabled={fontSize === fontSizes[fontSizes.length - 1]}
              onClick={() => changeFontSize(1)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-300 disabled:opacity-40 dark:border-neutral-700"
            >
              <Plus aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        {notice && (
          <p role="status" className="no-print mb-4 text-sm text-neutral-600 dark:text-neutral-300">
            {notice}
          </p>
        )}
        <div
          className="whitespace-pre-wrap pb-16 font-serif leading-[1.9] text-neutral-800 dark:text-neutral-100"
          style={{ fontSize: `${fontSize}px` }}
        >
          {song.lyrics}
        </div>
      </article>
    </main>
  );
}

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(favoriteStorageKey) ?? '[]',
    );
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}