import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { authenticateAdmin } from '../utils/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  reasonMessage?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  reasonMessage,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setShowPassword(false);
      setIsSubmitting(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('कृपया पासवर्ड प्रविष्ट करा.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Verify admin password
    const isValid = authenticateAdmin(password);
    if (isValid) {
      setIsSubmitting(false);
      onLoginSuccess();
      onClose();
    } else {
      setIsSubmitting(false);
      setError('चुकीचा पासवर्ड. कृपया योग्य ॲडमिन पासवर्ड टाका.');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                ॲडमिन प्रवेश (Admin Access)
              </h3>
              <p className="text-xs text-indigo-200/80 font-medium">
                प्रशासकीय नियंत्रणासाठी पासवर्ड आवश्यक
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {reasonMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{reasonMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ॲडमिन पासवर्ड (Admin Password)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="पासवर्ड टाका..."
                autoComplete="off"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-700 animate-shake">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>प्रवेश करा (Unlock Admin)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
