import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

interface InstallFloatingBannerProps {
  onInstall: () => void;
  isStandalone: boolean;
}

export const InstallFloatingBanner: React.FC<InstallFloatingBannerProps> = ({
  onInstall,
  isStandalone,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('anubandh_install_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delay appearance slightly so page loads gracefully first
    const timer = setTimeout(() => setIsMounted(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isStandalone || isDismissed || !isMounted) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('anubandh_install_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-40 sm:max-w-md animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl shadow-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
        {/* App Logo & Quick Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src="/icon.svg"
              alt="Anubandh App Logo"
              className="w-10 h-10 rounded-xl shadow-md border border-amber-400/30 object-contain p-0.5 bg-white/10"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                Anubandh ॲप इन्स्टॉल करा
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex-shrink-0">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-rose-200/90 truncate mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300 flex-shrink-0" />
              <span>ऑफलाइन वापरा • थेट मोबाईल स्क्रीनवर</span>
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onInstall}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white shadow-md shadow-emerald-500/30 transition-all border border-emerald-400/40"
            title="मोबाईल किंवा संगणकावर ॲप इन्स्टॉल करा"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">इन्स्टॉल</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="ही सूचना बंद करा"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
