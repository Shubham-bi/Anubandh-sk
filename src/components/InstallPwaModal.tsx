import React, { useState } from 'react';
import {
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  Laptop,
  Download,
  Sparkles
} from 'lucide-react';
import { BottomSheet } from './BottomSheet';

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
  const [deviceTab, setDeviceTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'android';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'desktop';
  });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="अनुबंध ॲप इन्स्टॉल करा"
      subtitle="दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध • ऑफलाइन ॲप"
      icon={
        <img
          src="/icon.svg"
          alt="अनुबंध"
          className="w-6 h-6 rounded-lg object-contain"
        />
      }
      maxWidth="max-w-lg"
      maxHeight="max-h-[88vh]"
    >
      <div className="space-y-4 text-xs">
        {/* Quick Direct 1-Click Install Button */}
        {canNativeInstall && onNativeInstall && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-950 block">
                  १-क्लिक थेट इन्स्टॉलेशन उपलब्ध आहे!
                </span>
                <span className="text-[11px] text-emerald-700">
                  कोणतीही वेगळी सेटिंग न करता थेट फोनवर ॲप जोडा.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>📲 थेट इन्स्टॉल करा</span>
            </button>
          </div>
        )}

        {/* Device selector tabs */}
        <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 text-xs">
          <button
            onClick={() => setDeviceTab('android')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === 'android'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🤖 Android</span>
          </button>
          <button
            onClick={() => setDeviceTab('ios')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === 'ios'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🍏 iPhone</span>
          </button>
          <button
            onClick={() => setDeviceTab('desktop')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>💻 संगणक</span>
          </button>
        </div>

        {/* Step-by-step instructions based on device */}
        <div className="space-y-3">
          {deviceTab === 'android' && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs">
                Android फोनमध्ये Chrome द्वारे कसे इन्स्टॉल करावे:
              </h4>
              <ol className="space-y-2 text-slate-700">
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
                      ॲप तुमच्या मोबाईल होम स्क्रीनवर स्वतंत्र ॲपप्रमाणे दिसेल व ऑफलाइन चालेल.
                    </span>
                  </div>
                </li>
              </ol>

              {/* Troubleshooting note for Android */}
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  💡 ॲप इन्स्टॉल झाल्यावर होम स्क्रीनवर न दिसल्यास:
                </span>
                <ul className="text-[11px] text-amber-900 space-y-0.5 list-disc list-inside">
                  <li>मोबाईलच्या <strong>App Drawer (सर्व ॲप्सची यादी)</strong> मध्ये वर स्वाइप करून <strong>'अनुबंध'</strong> शोधा.</li>
                  <li>Launcher सेटिंग्जमध्ये नवीन ॲप्स थेट होम स्क्रीनवर न येण्याचा पर्याय असू शकतो. App Drawer मधून आयकॉन ओढून होम स्क्रीनवर ठेवू शकता.</li>
                  <li>आधीचे जुने व्हर्जन असल्यास Phone Settings &gt; Apps मधून जुने ॲप Uninstall करा.</li>
                </ul>
              </div>
            </div>
          )}

          {deviceTab === 'ios' && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs">
                iPhone / iPad वर Safari द्वारे कसे जोडावे:
              </h4>
              <ol className="space-y-2 text-slate-700">
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
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs">
                संगणक / लॅपटॉपवर (Chrome / Edge):
              </h4>
              <ol className="space-y-2 text-slate-700">
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
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-1">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              ॲपचे फायदे:
            </span>
            <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
              <li>इंटरनेट बंद असतानाही सर्व प्रोफाईल्स व संपर्क नंबर उघडतात.</li>
              <li>मोबाईलमध्ये जागा नगण्य लागते (&lt; 3 MB).</li>
              <li>नवीन स्थळे आपोआप सिंक होतात.</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors text-center"
          >
            समजले (Got it)
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
