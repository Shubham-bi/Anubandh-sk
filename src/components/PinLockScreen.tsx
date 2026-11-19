import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, RotateCcw, Heart, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { authenticateParent } from '../utils/auth';

interface PinLockScreenProps {
  onUnlock: () => void;
  onOpenGroomProfile: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock, onOpenGroomProfile }) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 4 && !isChecking) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setIsError(false);
      setErrorMessage('');

      if (nextPin.length === 4) {
        setIsChecking(true);
        setTimeout(() => {
          const isValid = authenticateParent(nextPin);
          if (isValid) {
            onUnlock();
          } else {
            setIsError(true);
            setErrorMessage('चुकीचा पिन. कृपया पुन्हा प्रयत्न करा.');
            setTimeout(() => {
              setPin('');
              setIsChecking(false);
            }, 600);
          }
        }, 150);
      }
    }
  }, [pin, isChecking, onUnlock]);

  const handleBackspace = useCallback(() => {
    if (isChecking) return;
    setIsError(false);
    setErrorMessage('');
    setPin((prev) => prev.slice(0, -1));
  }, [isChecking]);

  const handleClear = useCallback(() => {
    if (isChecking) return;
    setIsError(false);
    setErrorMessage('');
    setPin('');
  }, [isChecking]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleClear]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f2] via-[#fffbf9] to-[#f8f1ec] flex flex-col items-center justify-between p-4 sm:p-6 select-none">
      {/* Top Branding Section */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center pt-6 sm:pt-10 text-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-white shadow-xl shadow-rose-900/10 border-2 border-rose-100 flex items-center justify-center p-2.5">
            <img
              src="/icon.svg"
              alt="अनुबंध"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          अनुबंध
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-rose-700 mt-1">
          दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध
        </p>

        {/* Security / Instructions Banner */}
        <div className="mt-5 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-200/60 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>पालकांसाठी सुरक्षित प्रवेश • ४ अंकी पिन टाका</span>
        </div>
      </div>

      {/* PIN Dots & Keypad Section */}
      <div className="w-full max-w-xs mx-auto flex flex-col items-center my-auto py-4">
        {/* PIN Circles Display */}
        <div
          className={`flex items-center justify-center gap-5 sm:gap-6 py-4 px-6 rounded-2xl transition-all duration-200 ${
            isError ? 'animate-shake bg-rose-50 border border-rose-200' : ''
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-200 ${
                  isError
                    ? 'bg-rose-500 scale-110 shadow-sm shadow-rose-500/50'
                    : isFilled
                    ? 'bg-rose-600 scale-110 shadow-sm shadow-rose-600/40 ring-4 ring-rose-100'
                    : 'border-2 border-slate-300 bg-white'
                }`}
              />
            );
          })}
        </div>

        {/* Error message or helper */}
        <div className="h-6 flex items-center justify-center text-center mt-1">
          {errorMessage ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">
              (पिन १ आठवडा आठवणीत ठेवला जाईल)
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              disabled={isChecking}
              className="h-16 sm:h-18 rounded-2xl bg-white hover:bg-rose-50 active:bg-rose-100 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-center text-2xl font-bold text-slate-800 active:scale-95 disabled:opacity-50"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isChecking || pin.length === 0}
            className="h-16 sm:h-18 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 transition-all flex flex-col items-center justify-center text-xs font-bold text-slate-600 active:scale-95 disabled:opacity-40"
            title="पिन साफ करा (Clear)"
          >
            <RotateCcw className="w-5 h-5 mb-0.5 text-slate-500" />
            <span>Clear</span>
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={isChecking}
            className="h-16 sm:h-18 rounded-2xl bg-white hover:bg-rose-50 active:bg-rose-100 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-center text-2xl font-bold text-slate-800 active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isChecking || pin.length === 0}
            className="h-16 sm:h-18 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 transition-all flex flex-col items-center justify-center text-xs font-bold text-slate-600 active:scale-95 disabled:opacity-40"
            title="मागचा अंक खोडा (Backspace)"
          >
            <Delete className="w-5 h-5 mb-0.5 text-slate-500" />
            <span>खोडा</span>
          </button>
        </div>
      </div>

      {/* Bottom Option: View Shubham's Groom Profile (Public link without PIN) */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center pb-4 pt-2 text-center">
        <button
          type="button"
          onClick={onOpenGroomProfile}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-rose-50/70 border border-rose-200/80 shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-rose-800 active:scale-98"
        >
          <User className="w-4 h-4 text-rose-600" />
          <span>चि. शुभम खर्चे - विवाह परिचय पत्रिका पहा</span>
        </button>

        <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center justify-center gap-1">
          <span>अनुबंध • सुरक्षित कौटुंबिक पोर्टल</span>
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
        </p>
      </div>
    </div>
  );
};
