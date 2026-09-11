import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone (installed) mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100">Install as Mobile / Desktop App</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Standalone App
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Run full-screen without browser URL bars, with an app icon on your home screen & offline engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install Application</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Install Chess Tutor App</h2>
                <p className="text-xs text-slate-400">Add to your device as an installed application</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  On Android (Chrome / Edge / Samsung Internet):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1 leading-relaxed">
                  <li>Tap the browser menu <strong className="text-white">(three dots ⋮)</strong> in the top-right corner.</li>
                  <li>Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
                  <li>Confirm <strong className="text-white">"Install"</strong>.</li>
                </ol>
                <p className="text-[10.5px] text-emerald-400 mt-1">
                  ✓ Android installs a native WebAPK in your App Drawer and Home Screen with its own app icon.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5" />
                  On iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1 leading-relaxed">
                  <li>Tap the <strong className="text-white">Share button</strong> (square with arrow pointing up).</li>
                  <li>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong className="text-white">"Add"</strong> in the top right.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <p className="font-bold text-amber-400">On Computer (Chrome / Edge):</p>
                <p className="text-[11px] text-slate-300">
                  Look at the right side of your browser URL bar for the <strong className="text-white">Install icon (⊕ or computer with arrow)</strong>, or open the menu and select <strong className="text-white">"Install Chess Tutor..."</strong>.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
