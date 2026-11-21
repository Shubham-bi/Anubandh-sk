import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  onUndo?: () => void;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose, duration = 1800 }) => {
  useEffect(() => {
    if (!toast) return;

    const autoCloseTimeout = toast.duration ?? duration;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseTimeout);

    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex justify-center sm:justify-end pointer-events-none animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs sm:text-sm font-semibold max-w-md">
        <span>{toast.message}</span>
        {toast.onUndo && (
          <button
            onClick={() => {
              toast.onUndo?.();
              onClose();
            }}
            className="flex items-center gap-1 font-bold text-rose-400 hover:text-rose-300 transition-colors ml-1 px-2 py-1 rounded-lg bg-white/10 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        )}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
