import React, { useState } from 'react';
import {
  Phone,
  Printer,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Download,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { getBiodataUrl, buildGenericShareMessage } from '../utils/messages';
import { SHUBHAM_BIODATA, GANESH_IMG_DATA } from '../constants/shubhamBiodataData';
import {
  getGeneratedBiodataImage,
  downloadBiodataCanvasImage,
  copyBiodataCanvasToClipboard
} from '../utils/biodataCanvasGenerator';
import { BottomSheet } from './BottomSheet';

interface GroomProfilePageProps {
  onBackToPortal?: () => void;
  isParentAuthenticated?: boolean;
}

export const GroomProfilePageComponent: React.FC<GroomProfilePageProps> = ({
  onBackToPortal,
  isParentAuthenticated = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);

  // Runtime dynamic URL computation
  const dynamicProfileUrl = getBiodataUrl();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Canvas is generated purely on-demand when user clicks Download, Preview or Share

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dynamicProfileUrl);
      setCopiedLink(true);
      showToast('✅ बायोडाटा लिंक कॉपी झाली!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('⚠️ लिंक कॉपी करता आली नाही');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPreviewModal = async () => {
    setIsPreviewOpen(true);
    if (!previewDataUrl) {
      setIsGeneratingCanvas(true);
      try {
        const { dataUrl } = await getGeneratedBiodataImage();
        setPreviewDataUrl(dataUrl);
      } catch (e) {
        console.error('Failed to generate canvas image:', e);
        showToast('इमेज तयार करताना त्रुटी आली.');
      } finally {
        setIsGeneratingCanvas(false);
      }
    }
  };

  const handleDownloadImage = async () => {
    showToast('⏳ इमेज डाऊनलोड होत आहे...');
    try {
      await downloadBiodataCanvasImage();
      showToast('✅ बायोडाटा इमेज डाऊनलोड झाली!');
    } catch (e) {
      console.error(e);
      showToast('डाऊनलोड करताना त्रुटी आली.');
    }
  };

  const handleCopyImage = async () => {
    showToast('⏳ इमेज क्लिपबोर्डवर कॉपी होत आहे...');
    const success = await copyBiodataCanvasToClipboard();
    if (success) {
      showToast('✅ बायोडाटा इमेज क्लिपबोर्डवर कॉपी झाली! (Ctrl+V ने पेस्ट करा)');
    } else {
      showToast('⚠️ आपल्या ब्राउझरमध्ये थेट इमेज कॉपी सपोर्ट नाही.');
    }
  };

  const handleShareWhatsApp = async () => {
    const proposalText = buildGenericShareMessage({ biodataUrl: dynamicProfileUrl });
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(proposalText)}`;

    try {
      const { file } = await getGeneratedBiodataImage();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'चि. शुभम अनिल खर्चे - विवाह परिचय पत्रिका',
          text: proposalText
        });
        showToast('✅ WhatsApp वर इमेज व मेसेज शेअर झाला!');
        return;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.warn('File share fallback:', e);
    }

    if (isMobile) {
      window.location.href = waUrl;
    } else {
      await handleCopyImage();
      window.open(waUrl, '_blank');
      showToast('📸 इमेज क्लिपबोर्डवर कॉपी झाली! WhatsApp मध्ये Paste (Ctrl+V) करा.');
    }
  };

  const handleShareNative = async () => {
    const proposalText = buildGenericShareMessage({ biodataUrl: dynamicProfileUrl });

    try {
      const { file } = await getGeneratedBiodataImage();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'चि. शुभम अनिल खर्चे - विवाह परिचय पत्रिका',
          text: proposalText
        });
        showToast('✅ इमेज व मेसेज शेअर झाला!');
        return;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.warn('Native share error:', e);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'चि. शुभम अनिल खर्चे - विवाह परिचय पत्रिका',
          text: proposalText,
          url: dynamicProfileUrl
        });
        showToast('✅ मेसेज शेअर झाला!');
        return;
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
      }
    }

    await handleCopyLink();
  };

  return (
    <div className="min-h-screen bg-[#eeeae5] py-4 sm:py-8 px-2 sm:px-4 font-sans text-[#343434] pb-28 print:pb-0 print:bg-white print:p-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] bg-[#1e293b] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xl transition-all duration-300 animate-fade-in text-center max-w-[90%]">
          {toastMessage}
        </div>
      )}

      <div className="max-w-[760px] mx-auto space-y-4">
        {/* Top Control Bar */}
        <header className="no-print flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-2xl border border-[#d8c9bd] shadow-sm">
          {onBackToPortal && isParentAuthenticated ? (
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-[#b94c2e]" />
              <span>वधू स्थळे पहा</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="अनुबंध" className="w-6 h-6 rounded-md object-contain" />
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">अनुबंध • वर परिचय</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenPreviewModal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
              title="कॅनव्हास कार्ड प्रिव्ह्यू"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">कॅनव्हास कार्ड</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all border border-sky-200"
              title="इमेज डाऊनलोड करा"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">डाऊनलोड</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              title="A4 प्रिंट करा किंवा PDF म्हणून जतन करा"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट</span>
            </button>
          </div>
        </header>

        {/* Authentic Marathi Patrika Sheet */}
        <main
          className="relative w-full max-w-[724px] min-h-[1024px] mx-auto bg-white border-2 border-[#222222] shadow-[0_10px_32px_rgba(45,35,25,0.12)] p-6 sm:p-9 pt-8 overflow-hidden print:border-none print:shadow-none print:p-4 print:min-h-0"
          style={{ outline: '1px solid #444444', outlineOffset: '-5px' }}
        >
          {/* Corner Flourish: Top Left */}
          <svg className="absolute w-20 h-20 top-1.5 left-1.5 pointer-events-none" viewBox="0 0 110 110" aria-hidden="true">
            <path d="M 8 100 C 8 75 12 55 22 40 C 32 25 45 16 65 12 C 80 9 95 8 104 8" fill="none" stroke="#333333" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M 12 85 C 12 65 18 48 30 35 C 42 22 58 14 85 12" fill="none" stroke="#555555" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="28" cy="28" r="3.2" fill="#222222"/>
            <circle cx="48" cy="18" r="2.4" fill="#333333"/>
            <circle cx="18" cy="48" r="2.4" fill="#333333"/>
            <circle cx="72" cy="14" r="2" fill="#444444"/>
            <circle cx="14" cy="72" r="2" fill="#444444"/>
            <path d="M 18 18 Q 38 38 52 52 Q 40 46 28 34 Z" fill="#333333"/>
          </svg>

          {/* Corner Flourish: Top Right */}
          <svg className="absolute w-20 h-20 top-1.5 right-1.5 pointer-events-none scale-x-[-1]" viewBox="0 0 110 110" aria-hidden="true">
            <path d="M 8 100 C 8 75 12 55 22 40 C 32 25 45 16 65 12 C 80 9 95 8 104 8" fill="none" stroke="#333333" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M 12 85 C 12 65 18 48 30 35 C 42 22 58 14 85 12" fill="none" stroke="#555555" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="28" cy="28" r="3.2" fill="#222222"/>
            <circle cx="48" cy="18" r="2.4" fill="#333333"/>
            <circle cx="18" cy="48" r="2.4" fill="#333333"/>
            <circle cx="72" cy="14" r="2" fill="#444444"/>
            <circle cx="14" cy="72" r="2" fill="#444444"/>
            <path d="M 18 18 Q 38 38 52 52 Q 40 46 28 34 Z" fill="#333333"/>
          </svg>

          {/* Corner Flourish: Bottom Left */}
          <svg className="absolute w-20 h-20 bottom-1.5 left-1.5 pointer-events-none scale-y-[-1]" viewBox="0 0 110 110" aria-hidden="true">
            <path d="M 8 100 C 8 75 12 55 22 40 C 32 25 45 16 65 12 C 80 9 95 8 104 8" fill="none" stroke="#333333" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M 12 85 C 12 65 18 48 30 35 C 42 22 58 14 85 12" fill="none" stroke="#555555" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="28" cy="28" r="3.2" fill="#222222"/>
            <circle cx="48" cy="18" r="2.4" fill="#333333"/>
            <circle cx="18" cy="48" r="2.4" fill="#333333"/>
            <circle cx="72" cy="14" r="2" fill="#444444"/>
            <circle cx="14" cy="72" r="2" fill="#444444"/>
            <path d="M 18 18 Q 38 38 52 52 Q 40 46 28 34 Z" fill="#333333"/>
          </svg>

          {/* Corner Flourish: Bottom Right */}
          <svg className="absolute w-20 h-20 bottom-1.5 right-1.5 pointer-events-none scale-[-1]" viewBox="0 0 110 110" aria-hidden="true">
            <path d="M 8 100 C 8 75 12 55 22 40 C 32 25 45 16 65 12 C 80 9 95 8 104 8" fill="none" stroke="#333333" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M 12 85 C 12 65 18 48 30 35 C 42 22 58 14 85 12" fill="none" stroke="#555555" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="28" cy="28" r="3.2" fill="#222222"/>
            <circle cx="48" cy="18" r="2.4" fill="#333333"/>
            <circle cx="18" cy="48" r="2.4" fill="#333333"/>
            <circle cx="72" cy="14" r="2" fill="#444444"/>
            <circle cx="14" cy="72" r="2" fill="#444444"/>
            <path d="M 18 18 Q 38 38 52 52 Q 40 46 28 34 Z" fill="#333333"/>
          </svg>

          {/* Header with Shri Ganesh */}
          <div className="text-center mb-4 relative z-10">
            <img
              src={GANESH_IMG_DATA}
              alt="श्री गणेश"
              className="w-16 h-16 mx-auto mb-1.5 object-contain"
            />
            <p className="text-[#1e293b] font-bold text-lg tracking-wide m-0">
              {SHUBHAM_BIODATA.invocation}
            </p>
          </div>

          {/* Section 1: वैयक्तिक माहिती */}
          <section className="mb-4">
            <h2 className="text-center text-[#1e293b] font-bold text-lg mb-2.5 tracking-wide">
              {SHUBHAM_BIODATA.personalTitle}
            </h2>
            <div className="max-w-[480px] mx-auto">
              <div className="grid grid-cols-[135px_20px_1fr] text-[15px] leading-[1.5] text-[#1e293b] font-medium gap-y-1.5">
                {SHUBHAM_BIODATA.personal.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="whitespace-nowrap">{item.label}</div>
                    <div className="text-center">:</div>
                    <div className="overflow-wrap-anywhere">
                      <span>{item.value}</span>
                      {item.subvalue && (
                        <span className="block text-[14px] text-[#1e293b] mt-0.5 font-normal">
                          {item.subvalue}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: कौटुंबिक माहिती */}
          <section className="mb-4">
            <h2 className="text-center text-[#1e293b] font-bold text-lg mb-2.5 tracking-wide">
              {SHUBHAM_BIODATA.familyTitle}
            </h2>
            <div className="max-w-[480px] mx-auto">
              <div className="grid grid-cols-[135px_20px_1fr] text-[15px] leading-[1.5] text-[#1e293b] font-medium gap-y-1.5">
                {SHUBHAM_BIODATA.family.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="whitespace-nowrap">{item.label}</div>
                    <div className="text-center">:</div>
                    <div className="overflow-wrap-anywhere">{item.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: संपर्क */}
          <section className="mb-2">
            <h2 className="text-center text-[#1e293b] font-bold text-lg mb-2.5 tracking-wide">
              {SHUBHAM_BIODATA.contactTitle}
            </h2>
            <div className="max-w-[480px] mx-auto flex flex-col gap-2.5 text-center">
              {SHUBHAM_BIODATA.contacts.map((contact, idx) => (
                <div key={idx} className="text-[14.5px] leading-[1.45] text-[#1e293b]">
                  <div className="font-medium">
                    {contact.name}, {contact.place}
                  </div>
                  <div className="font-medium tracking-wide">
                    <a
                      href={`tel:${contact.phoneClean}`}
                      className="inline-flex items-center justify-center gap-1 hover:text-[#b94c2e] hover:underline transition-colors"
                      title={`${contact.name} यांना कॉल करा`}
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{contact.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Floating Bottom Action Bar */}
      <footer className="no-print fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-1.5 border-[#d8c9bd] py-2.5 px-3 z-[9999] shadow-[0_-4px_18px_rgba(45,35,25,0.15)] flex justify-center items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          title="WhatsApp वर थेट इमेज व मेसेज शेअर करा"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp वर पाठवा</span>
        </button>

        <button
          type="button"
          onClick={handleOpenPreviewModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          title="कॅनव्हास कार्ड प्रिव्ह्यू उघडा"
        >
          <ImageIcon className="w-4 h-4" />
          <span>कॅनव्हास कार्ड</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadImage}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          title="बायोडाटा इमेज PNG डाऊनलोड करा"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">इमेज डाऊनलोड</span>
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#1e293b] border border-[#cbd5e1] text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          title="इमेज क्लिपबोर्डवर कॉपी करा"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">इमेज कॉपी</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#1e293b] border border-[#cbd5e1] text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          title="वेबपेज लिंक कॉपी करा"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4" />}
          <span>{copiedLink ? 'कॉपी झाले!' : 'लिंक कॉपी'}</span>
        </button>
      </footer>

      {/* Canvas Share Card Preview Bottom Sheet */}
      <BottomSheet
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="विवाह परिचय पत्रिका (कॅनव्हास कार्ड)"
        subtitle="चि. शुभम अनिल खर्चे विवाह पत्रिका कार्ड"
        icon={<ImageIcon className="w-5 h-5 text-[#881337]" />}
        maxWidth="max-w-lg"
        maxHeight="max-h-[90vh]"
      >
        <div className="text-center space-y-4">
          {isGeneratingCanvas ? (
            <div className="py-12 space-y-3">
              <div className="animate-spin text-3xl">🎨</div>
              <p className="text-sm font-semibold text-slate-600">
                कॅनव्हास कार्ड तयार होत आहे, कृपया प्रतीक्षा करा...
              </p>
            </div>
          ) : previewDataUrl ? (
            <div className="space-y-4">
              <img
                src={previewDataUrl}
                alt="चि. शुभम अनिल खर्चे विवाह पत्रिका कार्ड"
                className="max-w-full max-h-[50vh] mx-auto rounded-xl shadow-lg border border-slate-200 object-contain"
              />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold shadow-xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp वर पाठवा</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareNative}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>इतर ॲप्स (Share)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाऊनलोड</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>इमेज कॉपी</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-rose-600 font-semibold text-sm">
              इमेज लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all"
            >
              बंद करा
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export const GroomProfilePage = React.memo(GroomProfilePageComponent);
