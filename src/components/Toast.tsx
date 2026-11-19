import React from 'react';
import { RotateCcw, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex justify-center sm:justify-end pointer-events-none animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs font-medium max-w-md">
        <span>{toast.message}</span>
        {toast.onUndo && (
          <button
            onClick={() => {
              toast.onUndo?.();
              onClose();
            }}
            className="flex items-center gap-1 font-bold text-rose-400 hover:text-rose-300 transition-colors ml-1 px-2 py-1 rounded-lg bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        )}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
