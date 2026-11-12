export default function InstallButton() {
  'use clien
t';
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
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
      >
        <Download size={16} /> Install App
      </button>

      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-sm w-full text-center space-y-4 text-slate-900 dark:text-white">
            <h3 className="text-xl font-bold">Install on iPhone</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Apple does not allow automatic downloads. To install this app:
            </p>
            <ol className="text-left text-sm space-y-2 list-decimal list-inside">
              <li>Tap the <strong>Share</strong> icon at the bottom of Safari.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right corner.</li>
            </ol>
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg w-full font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}