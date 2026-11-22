'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ContentManager from './content-manager';
import ProductManager from './product-manager';

type AdminSong = {
  id: string;
  number: number;
  title: string;
  lyrics: string;
  language: string;
};

type SongForm = {
  number: string;
  title: string;
  lyrics: string;
  language: 'Hindi' | 'Bengali';
};

type Section = 'content' | 'products' | 'songs';

const emptySong: SongForm = {
  number: '',
  title: '',
  lyrics: '',
  language: 'Hindi',
};

export default function AdminClient({
  isAuthenticated: initiallyAuthenticated,
  isConfigured,
  initialSection,
  initialSongs,
}: {
  isAuthenticated: boolean;
  isConfigured: boolean;
  initialSection: Section;
  initialSongs: AdminSong[];
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(initiallyAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [songs, setSongs] = useState<AdminSong[]>(initialSongs);
  const [formData, setFormData] = useState<SongForm>(emptySong);
  const [section, setSection] = useState<Section>(initialSection);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function fetchSongs() {
    const response = await fetch('/api/songs', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load songs.');
    setSongs((await response.json()) as AdminSong[]);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'Could not sign in.');
        return;
      }

      setEmail('');
      setPassword('');
      setIsAuthenticated(true);
      setSection(initialSection);
      if (initialSection === 'songs') {
        fetchSongs().catch((cause: unknown) =>
          setError(
            cause instanceof Error ? cause.message : 'Could not load songs.',
          ),
        );
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not sign out.');
      setIsAuthenticated(false);
      setSongs([]);
      setError('');
      router.refresh();
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not save the song.');
      setFormData(emptySong);
      await fetchSongs();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the song.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    setError('');
    try {
      const response = await fetch(`/api/songs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not delete the song.');
      await fetchSongs();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the song.');
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#0A0A0A] p-4">
        <section className="w-full max-w-md rounded-xl border border-[#292929] bg-[#141414] p-7">
          <h1 className="text-center text-2xl font-semibold text-white">
            Jeevan Geet Admin
          </h1>
          <p className="mb-6 mt-2 text-center text-sm text-[#A3A3A3]">
            Sign in with your admin email and password.
          </p>
          {!isConfigured ? (
            <p role="alert" className="text-sm text-red-400">
              Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and
              ADMIN_SESSION_SECRET in the deployment environment.
            </p>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                autoComplete="username"
                className="w-full rounded-md border border-[#292929] bg-[#0A0A0A] p-3 text-white placeholder:text-[#666]"
                placeholder="Admin email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                autoComplete="current-password"
                className="w-full rounded-md border border-[#292929] bg-[#0A0A0A] p-3 text-white placeholder:text-[#666]"
                placeholder="Password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <button
                className="w-full rounded-md bg-white py-3 font-semibold text-black disabled:opacity-50"
                disabled={busy}
                type="submit"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Jeevan Geet Admin</h1>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Publish gospel content and manage your product catalog.
            </p>
          </div>
          <button
            className="rounded-md border border-[#292929] px-4 py-2 text-sm text-[#A3A3A3] hover:text-white"
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </header>
        <nav className="mb-6 flex flex-wrap gap-2 border-b border-[#292929] pb-4">
          {([
            ['content', 'Articles & reports'],
            ['products', 'Products'],
            ['songs', 'Songs'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              className={`rounded-md px-4 py-2 text-sm ${
                section === value
                  ? 'bg-white font-semibold text-black'
                  : 'border border-[#292929] text-[#A3A3A3]'
              }`}
              onClick={() => {
                setSection(value);
                setError('');
                if (value === 'songs') {
                  fetchSongs().catch((cause: unknown) =>
                    setError(
                      cause instanceof Error ? cause.message : 'Could not load songs.',
                    ),
                  );
                }
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>

        {section === 'content' && <ContentManager />}
        {section === 'products' && <ProductManager />}
        {section === 'songs' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="h-fit rounded-xl border border-[#292929] bg-[#141414] p-5">
              <h2 className="mb-5 text-xl font-semibold">Add song</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-3">
                  <input
                    className="w-1/3 rounded-md border border-[#292929] bg-[#0A0A0A] p-2 text-white"
                    min="1"
                    placeholder="Song #"
                    required
                    type="number"
                    value={formData.number}
                    onChange={(event) =>
                      setFormData({ ...formData, number: event.target.value })
                    }
                  />
                  <select
                    className="w-2/3 rounded-md border border-[#292929] bg-[#0A0A0A] p-2 text-white"
                    value={formData.language}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        language: event.target.value as SongForm['language'],
                      })
                    }
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </div>
                <input
                  className="w-full rounded-md border border-[#292929] bg-[#0A0A0A] p-2 text-white"
                  placeholder="Song title"
                  required
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                />
                <textarea
                  className="w-full rounded-md border border-[#292929] bg-[#0A0A0A] p-2 text-white"
                  placeholder="Paste lyrics here..."
                  required
                  rows={10}
                  value={formData.lyrics}
                  onChange={(event) =>
                    setFormData({ ...formData, lyrics: event.target.value })
                  }
                />
                {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                <button
                  className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                  disabled={busy}
                  type="submit"
                >
                  {busy ? 'Saving…' : 'Save song'}
                </button>
              </form>
            </section>
            <section className="rounded-xl border border-[#292929] bg-[#141414] p-5">
              <h2 className="mb-4 text-xl font-semibold">Songs ({songs.length})</h2>
              <div className="max-h-[700px] space-y-2 overflow-y-auto">
                {songs.map((song) => (
                  <article
                    key={song.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#292929] bg-[#1C1C1C] p-3"
                  >
                    <p className="text-sm">
                      <span className="mr-2 text-[#A3A3A3]">#{song.number}</span>
                      {song.title}
                      <span className="ml-2 text-[#666]">({song.language})</span>
                    </p>
                    <button
                      className="text-sm text-red-400"
                      onClick={() => handleDelete(song.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </article>
                ))}
                {songs.length === 0 && (
                  <p className="py-8 text-center text-sm text-[#A3A3A3]">
                    No songs found.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
