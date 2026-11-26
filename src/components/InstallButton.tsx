'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for Android PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // 2. Check if the app is already installed (Standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }

    // 3. Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 4. Listen for Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("To install this app, tap your browser menu and select 'Add to Home Screen'.");
    }
  };

  // Hide the button if the app is already installed
  if (isStandalone) return null;

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-300"
      >
        <Download size={16} /> Install App
      </button>

      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-6 text-center text-neutral-950 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
            <h3 className="text-xl font-bold">Install on iPhone</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Apple does not allow automatic downloads. To install this app:
            </p>
            <ol className="text-left text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>Share</strong> icon at the bottom of Safari.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right corner.</li>
            </ol>
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="mt-4 w-full rounded-md bg-neutral-950 px-6 py-2 font-medium text-white dark:bg-white dark:text-neutral-950"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}