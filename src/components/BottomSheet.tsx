import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-lg' or 'max-w-xl'
  maxHeight?: string; // e.g. 'max-h-[85vh]'
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerActions,
  children,
  maxWidth = 'max-w-xl',
  maxHeight = 'max-h-[88vh]',
  showHandle = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full ${maxWidth} mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-200/90 flex flex-col ${maxHeight} animate-in slide-in-from-bottom duration-300 ease-out sm:rounded-3xl sm:mb-4 sm:border overflow-hidden`}
      >
        {/* Top Drag Handle */}
        {showHandle && (
          <div className="pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
          </div>
        )}

        {/* Sheet Header (if title or subtitle provided) */}
        {(title || subtitle || icon || headerActions) && (
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Sheet Content */}
        <div className="overflow-y-auto px-5 py-4 flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
