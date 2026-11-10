'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for Android/Chrome install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show custom instructions for iPhone
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      // Show native install prompt for Android/Desktop
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("To install this app, tap your browser menu and select 'Add to Home Screen'.");
    }
  };

  // If already installed, don't show the button
  if (window.matchMedia('(display-mode: standalone)').matches) return null;

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
      >
        <Download size={16} /> Install App
      </button>

      {/* iOS Instructions Popup */}
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