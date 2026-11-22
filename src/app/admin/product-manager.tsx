'use client';

import { useEffect, useState } from 'react';

type AdminProduct = {
  id: string;
  title: string;
  description: string;
  price_minor: number;
  image_path: string;
  image_url: string;
  is_published: boolean;
};

type ProductForm = Omit<AdminProduct, 'id' | 'image_url' | 'price_minor'> & {
  price: string;
};
type UploadedImage = { path: string; url: string };
const emptyForm: ProductForm = {
  title: '',
  description: '',
  price: '',
  image_path: '',
  is_published: false,
};

export default function ProductManager() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string>();
  const [image, setImage] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadItems() {
    const response = await fetch('/api/admin/products', { cache: 'no-store' });
    const result = (await response.json()) as AdminProduct[] | { error?: string };
    if (!response.ok || !Array.isArray(result)) {
      throw new Error(!Array.isArray(result) ? result.error : 'Could not load products.');
    }
    setItems(result);
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/products', { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as
          | AdminProduct[]
          | { error?: string };
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(
            !Array.isArray(result) ? result.error : 'Could not load products.',
          );
        }
        if (active) setItems(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : 'Could not load products.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function editItem(item: AdminProduct) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      price: (item.price_minor / 100).toFixed(2),
      image_path: item.image_path,
      is_published: item.is_published,
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
    data.set('category', 'products');
    const response = await fetch('/api/admin/upload', { method: 'POST', body: data });
    const result = (await response.json()) as UploadedImage | { error?: string };
    if (!response.ok || !('path' in result)) {
      throw new Error('error' in result ? result.error : 'Image upload failed.');
    }
    return result;
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadImage();
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          title: form.title,
          description: form.description,
          price_minor: Math.round(Number(form.price) * 100),
          image_path: uploaded?.path ?? form.image_path,
          is_published: form.is_published,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not save product.');
      resetForm();
      await loadItems();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save product.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(item: AdminProduct) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError('');
    try {
      const response = await fetch(
        `/api/admin/products?id=${encodeURIComponent(item.id)}`,
        { method: 'DELETE' },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not delete product.');
      await loadItems();
      if (editingId === item.id) resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete product.');
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
              {editingId ? 'Edit product' : 'Add a product'}
            </h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Catalog only for now. Payments and checkout are not enabled.
            </p>
          </div>
          {editingId && (
            <button type="button" className="text-sm text-[#A3A3A3]" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
        <form className="space-y-4" onSubmit={saveProduct}>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Product name
            <input
              className={inputClass}
              maxLength={200}
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Description
            <textarea
              className={inputClass}
              maxLength={10_000}
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Price (INR)
            <input
              className={inputClass}
              min="0"
              max="1000000"
              required
              step="0.01"
              type="number"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-[#A3A3A3]">
            Product image (JPG, PNG, or WebP; up to 4 MB)
            <input
              key={imageInputKey}
              accept="image/jpeg,image/png,image/webp"
              className={inputClass}
              required={!form.image_path}
              type="file"
              onChange={(event) => setImage(event.target.files?.[0])}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              checked={form.is_published}
              type="checkbox"
              onChange={(event) => setForm({ ...form, is_published: event.target.checked })}
            />
            Show in the app
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Save product'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#292929] bg-[#141414] p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">Products ({items.length})</h2>
        <div className="max-h-[850px] space-y-3 overflow-y-auto">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-[#292929] bg-[#1C1C1C] p-3">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="mb-3 h-32 w-full rounded-md object-cover"
                  src={item.image_url}
                />
              )}
              <p className="text-xs uppercase tracking-wide text-[#A3A3A3]">
                {item.is_published ? 'Visible in app' : 'Draft'}
              </p>
              <h3 className="mt-1 font-medium text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-[#A3A3A3]">
                ₹{(item.price_minor / 100).toFixed(2)}
              </p>
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
            <p className="py-8 text-center text-sm text-[#A3A3A3]">No products yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
