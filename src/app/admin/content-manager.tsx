'use client';

import { useEffect, useState } from 'react';

type AdminContent = {
  id: string;
  kind: 'article' | 'ministry_report';
  title: string;
  category: string;
  summary: string;
  cover_path: string;
  cover_url: string;
  body: string;
  testimony: string | null;
  is_published: boolean;
  published_at: string | null;
};

type ContentForm = Omit<AdminContent, 'id' | 'cover_url'>;
type UploadedImage = { path: string; url: string };
const emptyForm: ContentForm = {
  kind: 'article',
  title: '',
  category: '',
  summary: '',
  cover_path: '',
  body: '',
  testimony: null,
  is_published: false,
  published_at: null,
};

export default function ContentManager() {
  const [items, setItems] = useState<AdminContent[]>([]);
  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string>();
  const [image, setImage] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadItems() {
    const response = await fetch('/api/admin/content', { cache: 'no-store' });
    const result = (await response.json()) as AdminContent[] | { error?: string };
    if (!response.ok || !Array.isArray(result)) {
      throw new Error(
        !Array.isArray(result) ? result.error : 'Could not load content.',
      );
    }
    setItems(result);
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/content', { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as
          | AdminContent[]
          | { error?: string };
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !Array.isArray(result) ? result.error : 'Could not load content.',
          );
        }
        if (active) setItems(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : 'Could not load content.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function editItem(item: AdminContent) {
    setEditingId(item.id);
    setForm({
      kind: item.kind,
      title: item.title,
      category: item.category,
      summary: item.summary,
      cover_path: item.cover_path,
      body: item.body,
      testimony: item.testimony,
      is_published: item.is_published,
      published_at: item.published_at,
    });
    setImage(undefined);
    setImageInputKey((key) => key + 1);
    setError('');
  }

  function resetForm() {
    setEditingId(undefined);
    setForm(emptyForm);
    setImage(undefined);
    setImageInputKey((key) => key + 1);
  }

  async function uploadImage(): Promise<UploadedImage | undefined> {
    if (!image) return undefined;
    const data = new FormData();
    data.set('file', image);
    data.set('category', 'content');
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: data,
    });
    const result = (await response.json()) as UploadedImage | { error?: string };
    if (!response.ok || !('path' in result)) {
      throw new Error('error' in result ? result.error : 'Image upload failed.');
    }
    return result;
  }

  async function saveContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadImage();
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: editingId,
          cover_path: uploaded?.path ?? form.cover_path,
          testimony: form.kind === 'ministry_report' ? form.testimony : null,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not save content.');
      resetForm();
      await loadItems();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save content.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(item: AdminContent) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError('');
    try {
      const response = await fetch(
        `/api/admin/content?id=${encodeURIComponent(item.id)}`,
        { method: 'DELETE' },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not delete content.');
      await loadItems();
      if (editingId === item.id) resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete content.');
    }
  }

  const inputClass =
    'w-full rounded-md border border-[#292929] bg-[#141414] px-3 py-2 text-sm text-white placeholder:text-[#666]';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
      <section className="rounded-xl border border-[#292929] bg-[#141414] p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {editingId ? 'Edit content' : 'Create content'}
            </h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Keep articles and ministry reports as separate posts.
            </p>
          </div>
          {editingId && (
            <button type="button" className="text-sm text-[#A3A3A3]" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
        <form className="space-y-4" onSubmit={saveContent}>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Content type
            <select
              className={inputClass}
              value={form.kind}
              onChange={(event) =>
                setForm({
                  ...form,
                  kind: event.target.value as ContentForm['kind'],
                  testimony: event.target.value === 'article' ? null : form.testimony,
                })
              }
            >
              <option value="article">Article</option>
              <option value="ministry_report">Ministry report</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Title
            <input
              className={inputClass}
              maxLength={200}
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Category
            <input
              className={inputClass}
              maxLength={100}
              placeholder="Faith, outreach, community..."
              required
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Short introduction
            <textarea
              className={inputClass}
              maxLength={1000}
              required
              rows={3}
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Cover image (JPG, PNG, or WebP; up to 4 MB)
            <input
              key={imageInputKey}
              accept="image/jpeg,image/png,image/webp"
              className={inputClass}
              required={!form.cover_path}
              type="file"
              onChange={(event) => setImage(event.target.files?.[0])}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            {form.kind === 'article' ? 'Article text' : 'Report'}
            <textarea
              className={inputClass}
              required
              rows={9}
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
            />
          </label>
          {form.kind === 'ministry_report' && (
            <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
              Testimony (optional)
              <textarea
                className={inputClass}
                rows={4}
                value={form.testimony ?? ''}
                onChange={(event) =>
                  setForm({ ...form, testimony: event.target.value })
                }
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              checked={form.is_published}
              type="checkbox"
              onChange={(event) =>
                setForm({ ...form, is_published: event.target.checked })
              }
            />
            Publish now
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Save content'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#292929] bg-[#141414] p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Articles and reports ({items.length})
        </h2>
        <div className="max-h-[850px] space-y-3 overflow-y-auto">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-[#292929] bg-[#1C1C1C] p-3">
              {item.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="mb-3 h-32 w-full rounded-md object-cover"
                  src={item.cover_url}
                />
              )}
              <p className="text-xs uppercase tracking-wide text-[#A3A3A3]">
                {item.kind === 'article' ? 'Article' : 'Ministry report'} ·{' '}
                {item.is_published ? 'Published' : 'Draft'}
              </p>
              <h3 className="mt-1 font-medium text-white">{item.title}</h3>
              <div className="mt-3 flex gap-4 text-sm">
                <button className="text-white underline" onClick={() => editItem(item)} type="button">
                  Edit
                </button>
                <button className="text-red-400 underline" onClick={() => deleteItem(item)} type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-[#A3A3A3]">
              No articles or reports yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
