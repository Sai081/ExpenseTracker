import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone (installed) mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (checkStandalone) {
      setIsStandalone(true);
      return;
    }

    const hasDismissed = sessionStorage.getItem('pwa_install_dismissed');
    if (hasDismissed) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_install_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0b211d]/95 border border-cyan-400/30 backdrop-blur-xl rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white tracking-wide">Install ExpenseTracker</h4>
              <span className="flex items-center text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-200 font-mono">PWA</span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">Install on your Mac, Windows, or phone for offline access.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
