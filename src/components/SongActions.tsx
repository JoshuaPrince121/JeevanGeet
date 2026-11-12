export default function SongActions() {
'use client';
import { Copy, Share2, Printer, Check } from 'lucide-react';
import { useState } from 'react';

export default function SongActions({ title, lyrics }: { title: string, lyrics: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${lyrics}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback for desktop
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-200 dark:border-slate-700 no-print">
      <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200">
        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} 
        {copied ? 'Copied!' : 'Copy Lyrics'}
      </button>
      <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200">
        <Share2 size={16} /> Share Link
      </button>
      <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200">
        <Printer size={16} /> Print
      </button>
    </div>
  );
}