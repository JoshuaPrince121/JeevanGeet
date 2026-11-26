import { notFound } from 'next/navigation';

import { fetchSongById, fetchSongs } from '../../../lib/song-repository';
import SongReader, { type ReaderSong } from './song-reader';

export const dynamic = 'force-dynamic';

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await fetchSongById(id);
  if (!song) notFound();

  const languageSongs = await fetchSongs({ language: song.language });
  const songIndex = languageSongs.findIndex((item) => item.id === song.id);

  return (
    <SongReader
      song={song}
      languageSongs={languageSongs satisfies ReaderSong[]}
      previousSong={songIndex > 0 ? languageSongs[songIndex - 1] : null}
      nextSong={
        songIndex >= 0 && songIndex < languageSongs.length - 1
          ? languageSongs[songIndex + 1]
          : null
      }
    />
  );
}