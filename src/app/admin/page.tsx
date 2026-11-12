'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [songs, setSongs] = useState<any[]>([]);
  const [formData, setFormData] = useState({ number: '', title: '', lyrics: '', language: 'Hindi' });

  useEffect(() => {
    if (sessionStorage.getItem('admin-auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'JeevanGeet2026!') { 
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      setError('');
    } else {
      setError('Incorrect password. Try again.');
    }
  };

  const fetchSongs = async () => {
    const res = await fetch('/api/songs');
    const data = await res.json();
    setSongs(data);
  };

  useEffect(() => { 
    if (isAuthenticated) fetchSongs(); 
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ number: '', title: '', lyrics: '', language: 'Hindi' });
    fetchSongs();
  };

  const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this song?')) return;
  await fetch(`/api/songs/${id}`, { method: 'DELETE' });
  fetchSongs(); 
  router.refresh(); // <--- THIS is the magic line that clears the cache!
  }; 

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="w-full border p-3 rounded bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold transition">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-900 dark:text-slate-100">
      
      {/* FORM SECTION */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700 h-fit">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add / Edit Song</h2>
          <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin-auth'); }} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input 
              type="number" placeholder="Song #" required
              className="w-1/3 border p-2 rounded bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})}
            />
            <select 
              className="w-2/3 border p-2 rounded bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}
            >
              <option value="Hindi">Hindi</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>
          <input 
            type="text" placeholder="Song Title" required
            className="w-full border p-2 rounded bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <textarea 
            placeholder="Paste lyrics here..." required rows={10}
            className="w-full border p-2 rounded font-serif bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            value={formData.lyrics} onChange={e => setFormData({...formData, lyrics: e.target.value})}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold transition">
            Save Song to Database
          </button>
        </form>
      </div>

      {/* LIST SECTION */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-4">Database ({songs.length} songs)</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {songs.map(song => (
            <div key={song.id} className="flex justify-between items-center p-3 border rounded bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">#{song.number}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{song.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({song.language})</span>
              </div>
              <button onClick={() => handleDelete(song.id)} className="text-red-500 text-sm hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}