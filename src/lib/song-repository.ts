import { createSupabaseAdminClient } from './supabase-admin';

export type SongRecord = {
  id: string;
  number: number;
  title: string;
  lyrics: string;
  language: string;
};

const songColumns = 'id, number, title, lyrics, language';

export async function fetchSongLanguages(): Promise<string[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('Song')
    .select('language')
    .order('language');
  if (error) throw error;

  return [
    ...new Set(
      (data ?? [])
        .map((row) => row.language)
        .filter((language): language is string => typeof language === 'string'),
    ),
  ];
}

export async function fetchSongs({
  query = '',
  language,
}: {
  query?: string;
  language?: string;
} = {}): Promise<SongRecord[]> {
  const client = createSupabaseAdminClient();
  const trimmedQuery = query.trim();
  const trimmedLanguage = language?.trim();

  function buildQuery() {
    let request = client.from('Song').select(songColumns);
    if (trimmedLanguage) {
      request = request.ilike('language', trimmedLanguage);
    }
    return request;
  }

  if (!trimmedQuery) {
    const { data, error } = await buildQuery().order('number');
    if (error) throw error;
    return data ?? [];
  }

  const searches = [
    buildQuery().ilike('title', `%${trimmedQuery}%`).order('number'),
    buildQuery().ilike('lyrics', `%${trimmedQuery}%`).order('number'),
  ];
  const number = /^\d+$/.test(trimmedQuery)
    ? Number(trimmedQuery)
    : undefined;
  if (number !== undefined) {
    searches.push(buildQuery().eq('number', number).order('number'));
  }

  const resultSets = await Promise.all(searches);
  const songsById = new Map<string, SongRecord>();
  for (const result of resultSets) {
    if (result.error) throw result.error;
    for (const row of result.data ?? []) {
      songsById.set(row.id, row);
    }
  }

  return [...songsById.values()].sort(
    (first, second) =>
      first.number - second.number ||
      first.title.localeCompare(second.title),
  );
}

export async function fetchSongById(id: string): Promise<SongRecord | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from('Song')
    .select(songColumns)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
