import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  Laptop,
  Download,
  Sparkles
} from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  canNativeInstall: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  canNativeInstall
}) => {
  const [deviceTab, setDeviceTab] = useState<'android' | 'ios' | 'desktop'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Anubandh ॲप इन्स्टॉल करा (PWA)
              </h3>
              <p className="text-xs text-rose-100">
                फोनच्या होम स्क्रीनवर ॲप जोडा व इंटरनेटशिवाय वापरा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Native Install Button if browser supports it */}
        {canNativeInstall && onNativeInstall && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-bold text-emerald-900">
                तुमचा ब्राउझर थेट इन्स्टॉलेशनला सपोर्ट करतो!
              </span>
            </div>
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>आत्ताच जोडा</span>
            </button>
          </div>
        )}

        {/* Device selector tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-1 text-xs">
          <button
            onClick={() => setDeviceTab('android')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === 'android'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🤖 Android</span>
          </button>
          <button
            onClick={() => setDeviceTab('ios')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === 'ios'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🍏 iPhone / iPad</span>
          </button>
          <button
            onClick={() => setDeviceTab('desktop')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === 'desktop'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>💻 संगणक / लॅपटॉप</span>
          </button>
        </div>

        {/* Step-by-step instructions based on device */}
        <div className="p-5 space-y-4 text-xs">
          {deviceTab === 'android' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>Android फोनमध्ये Chrome द्वारे कसे इन्स्टॉल करावे:</span>
              </h4>
              <ol className="space-y-2.5 text-slate-700">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    १
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">ब्राउझर मेनू उघडा</span>
                    <span className="text-[11px] text-slate-500">
                      Chrome च्या उजव्या कोपऱ्यातील तीन ठिपक्यांवर (<MoreVertical className="w-3 h-3 inline text-slate-600" />) टॅप करा.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    २
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">"Install app" किंवा "Add to Home screen" निवडा</span>
                    <span className="text-[11px] text-slate-500">
                      मेनूमध्ये <strong>'Install app'</strong> किंवा <strong>'Add to Home screen'</strong> पर्यायावर क्लिक करा.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    ३
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">Install वर टॅप करा</span>
                    <span className="text-[11px] text-slate-500">
                      ॲप तुमच्या मोबाईल होम स्क्रीनवर प्ले स्टोअरच्या ॲपप्रमाणे दिसेल व ऑफलाइन चालेल.
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {deviceTab === 'ios' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>iPhone / iPad वर Safari द्वारे कसे जोडावे:</span>
              </h4>
              <ol className="space-y-2.5 text-slate-700">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    १
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">Safari ब्राउझरमध्ये उघडा</span>
                    <span className="text-[11px] text-slate-500">
                      ही साईट Apple Safari ब्राउझरमध्ये उघडा.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    २
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">Share बटणावर टॅप करा</span>
                    <span className="text-[11px] text-slate-500">
                      स्क्रीनच्या खालील बाजूस असलेल्या <Share className="w-3.5 h-3.5 inline text-blue-600" /> (Share) आयकॉनवर टॅप करा.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    ३
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">"Add to Home Screen" निवडा</span>
                    <span className="text-[11px] text-slate-500">
                      खाली स्क्रोल करून <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /> <strong>'Add to Home Screen'</strong> वर टॅप करा व वर उजवीकडे <strong>'Add'</strong> दाबा.
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {deviceTab === 'desktop' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>संगणक / लॅपटॉपवर (Chrome / Edge):</span>
              </h4>
              <ol className="space-y-2.5 text-slate-700">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    १
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">ॲड्रेस बारमधील आयकॉन तपासा</span>
                    <span className="text-[11px] text-slate-500">
                      ब्राउझरच्या URL ॲड्रेस बारमध्ये उजव्या बाजूस <Download className="w-3 h-3 inline text-purple-600" /> (Install app) आयकॉन दिसेल.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                    २
                  </span>
                  <div>
                    <span className="font-semibold block text-slate-900">Install वर क्लिक करा</span>
                    <span className="text-[11px] text-slate-500">
                      त्यावर क्लिक केल्यावर स्वतंत्र विंडोज ॲपप्रमाणे डेस्कटॉपवर इन्स्टॉल होईल.
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Benefits Box */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              PWA ॲपचे फायदे:
            </span>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li>इंटरनेट बंद असतानाही सर्व प्रोफाईल्स व संपर्क नंबर उघडतात.</li>
              <li>मोबाईलमध्ये जागा (Storage) नगण्य लागते (&lt; 3 MB).</li>
              <li>नवीन स्थळे आपोआप अपडेट होतात.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            समजले (Got it)
          </button>
        </div>
      </div>
    </div>
  );
};
