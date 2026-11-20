import React, { useState, useEffect } from 'react';
import {
  Phone,
  Share2,
  ArrowLeft,
  Download,
  Camera,
  FileText,
  Eye,
  Trash2
} from 'lucide-react';
import { getBiodataUrl, buildGenericShareMessage } from '../utils/messages';
import { SHUBHAM_BIODATA, GANESH_IMG_DATA } from '../constants/shubhamBiodataData';
import {
  getGeneratedBiodataImage,
  downloadBiodataCanvasImage
} from '../utils/biodataCanvasGenerator';
import {
  subscribeGroomPhoto,
  saveGroomPhoto,
  removeGroomPhoto,
  downloadGroomPhotoImage,
  shareGroomPhotoImage
} from '../services/groomProfileService';
import { GroomPhotoUploadModal } from './GroomPhotoUploadModal';

interface GroomProfilePageProps {
  onBackToPortal?: () => void;
  isParentAuthenticated?: boolean;
  isAdminAuthenticated?: boolean;
  onAdminLoginRequest?: (reason?: string) => void;
}

export const GroomProfilePageComponent: React.FC<GroomProfilePageProps> = ({
  onBackToPortal,
  isParentAuthenticated = false,
  isAdminAuthenticated = false,
  onAdminLoginRequest
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'biodata' | 'photo'>('biodata');
  const [groomPhoto, setGroomPhoto] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Subscribe to real-time groom photo updates (local cache + Firebase cloud sync)
  useEffect(() => {
    const unsubscribe = subscribeGroomPhoto((photo) => {
      setGroomPhoto(photo);
    });
    return () => unsubscribe();
  }, []);

  // Runtime dynamic URL computation
  const dynamicProfileUrl = getBiodataUrl();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dynamicProfileUrl);
      showToast('✅ बायोडाटा लिंक कॉपी झाली!');
    } catch {
      showToast('⚠️ लिंक कॉपी करता आली नाही');
    }
  };

  // 1. Biodata Handlers (Strictly Shubham-Kharche.png)
  const handleDownloadBiodata = async () => {
    showToast('⏳ बायोडाटा डाऊनलोड होत आहे...');
    try {
      await downloadBiodataCanvasImage();
      showToast('✅ बायोडाटा इमेज (Shubham-Kharche.png) डाऊनलोड झाली!');
    } catch (e) {
      console.error(e);
      showToast('डाऊनलोड करताना त्रुटी आली.');
    }
  };

  const handleShareBiodata = async () => {
    const proposalText = buildGenericShareMessage({ biodataUrl: dynamicProfileUrl });

    try {
      const { file } = await getGeneratedBiodataImage();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'चि. शुभम अनिल खर्चे - विवाह परिचय पत्रिका',
          text: proposalText
        });
        showToast('✅ बायोडाटा इमेज व मेसेज शेअर झाला!');
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

  // 2. Separate Photo Handlers (Strictly Shubham-Kharche-Photo.jpg)
  const handleDownloadPhoto = () => {
    if (!groomPhoto) return;
    downloadGroomPhotoImage(groomPhoto);
    showToast('✅ वर फोटो (Shubham-Kharche-Photo.jpg) डाऊनलोड झाला!');
  };

  const handleSharePhoto = async () => {
    if (!groomPhoto) return;
    const success = await shareGroomPhotoImage(groomPhoto);
    if (success) {
      showToast('✅ वर फोटो शेअर झाला!');
    } else {
      showToast('⚠️ फोटो शेअर करता आला नाही');
    }
  };

  // 3. Photo Management Handlers
  const handleSavePhoto = async (photoDataUrl: string) => {
    try {
      await saveGroomPhoto(photoDataUrl);
      showToast('✅ वर फोटो सेव्ह झाला व क्लाउडवर सिंक झाला!');
    } catch {
      showToast('⚠️ फोटो सेव्ह करताना त्रुटी आली.');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeGroomPhoto();
      showToast('✅ वर फोटो काढून टाकला!');
    } catch {
      showToast('⚠️ फोटो काढताना त्रुटी आली.');
    }
  };

  const handleOpenPhotoManager = () => {
    if (isAdminAuthenticated) {
      setIsUploadModalOpen(true);
    } else if (onAdminLoginRequest) {
      onAdminLoginRequest('वर फोटो अपलोड करण्यासाठी ॲडमिन पासवर्ड आवश्यक आहे.');
    } else {
      setIsUploadModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#eeeae5] py-4 sm:py-8 px-2 sm:px-4 font-sans text-[#343434] pb-10 print:pb-0 print:bg-white print:p-0">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
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

          {/* Action Buttons based on Active Tab */}
          <div className="flex items-center gap-2">
            {activeTab === 'biodata' ? (
              <>
                <button
                  type="button"
                  onClick={handleShareBiodata}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16a34a] flex items-center justify-center border border-emerald-200 transition-all active:scale-90 shadow-xs cursor-pointer"
                  title="बायोडाटा शेअर करा (Share Biodata)"
                  aria-label="Share Biodata"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBiodata}
                  className="px-3 h-9 sm:h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#881337] flex items-center gap-1.5 border border-rose-200 transition-all active:scale-90 shadow-xs cursor-pointer text-xs font-bold"
                  title="बायोडाटा इमेज डाऊनलोड करा (Shubham-Kharche.png)"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">बायोडाटा डाऊनलोड</span>
                </button>
              </>
            ) : (
              <>
                {groomPhoto && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200 transition-all active:scale-90 shadow-xs cursor-pointer"
                      title="मोठा फोटो पहा (View Fullscreen)"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSharePhoto}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16a34a] flex items-center justify-center border border-emerald-200 transition-all active:scale-90 shadow-xs cursor-pointer"
                      title="फोटो शेअर करा (Share Photo)"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPhoto}
                      className="px-3 h-9 sm:h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#881337] flex items-center gap-1.5 border border-rose-200 transition-all active:scale-90 shadow-xs cursor-pointer text-xs font-bold"
                      title="फोटो डाऊनलोड करा (Shubham-Kharche-Photo.jpg)"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">फोटो डाऊनलोड</span>
                    </button>
                  </>
                )}

                {/* Admin Upload / Change Button */}
                <button
                  type="button"
                  onClick={handleOpenPhotoManager}
                  className="px-3 h-9 sm:h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-90 cursor-pointer text-xs font-bold"
                  title="वर फोटो व्यवस्थापन"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">{groomPhoto ? 'फोटो / लिंक बदला' : 'फोटो / लिंक जोडा'}</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Tab Switcher: Separate Biodata vs Photo */}
        <div className="no-print grid grid-cols-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#d8c9bd] shadow-xs text-xs font-bold gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'biodata'
                ? 'bg-gradient-to-r from-rose-800 to-rose-700 text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">📄 विवाह पत्रिका (Shubham-Kharche.png)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-gradient-to-r from-rose-800 to-rose-700 text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Camera className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">🤵 वर फोटो (Shubham-Kharche-Photo.jpg)</span>
            {groomPhoto && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
          </button>
        </div>

        {/* Tab 1 Content: Pure Authentic Marathi Patrika Sheet (Strictly as it was, no photo inside) */}
        {activeTab === 'biodata' && (
          <div className="space-y-3 animate-fade-in">
            <main
              className="relative w-full max-w-[740px] min-h-[1050px] mx-auto bg-white border-2 border-[#222222] shadow-[0_10px_32px_rgba(45,35,25,0.12)] p-6 sm:p-9 pt-10 sm:pt-14 pb-12 sm:pb-16 overflow-hidden print:border-none print:shadow-none print:p-4 print:min-h-0"
              style={{ outline: '1px solid #444444', outlineOffset: '-6px' }}
            >
              {/* Corner Flourish: Top Left */}
              <svg className="absolute w-20 h-20 top-2 left-2 pointer-events-none" viewBox="0 0 110 110" aria-hidden="true">
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
              <svg className="absolute w-20 h-20 top-2 right-2 pointer-events-none scale-x-[-1]" viewBox="0 0 110 110" aria-hidden="true">
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
              <svg className="absolute w-20 h-20 bottom-2 left-2 pointer-events-none scale-y-[-1]" viewBox="0 0 110 110" aria-hidden="true">
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
              <svg className="absolute w-20 h-20 bottom-2 right-2 pointer-events-none scale-[-1]" viewBox="0 0 110 110" aria-hidden="true">
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
              <div className="text-center mb-6 sm:mb-7 relative z-10">
                <img
                  src={GANESH_IMG_DATA}
                  alt="श्री गणेश"
                  className="w-16 h-16 sm:w-[68px] sm:h-[68px] mx-auto mb-2 object-contain"
                />
                <p className="text-[#1e293b] font-bold text-lg sm:text-[19px] tracking-wide m-0">
                  {SHUBHAM_BIODATA.invocation}
                </p>
              </div>

              {/* Section 1: वैयक्तिक माहिती */}
              <section className="mb-6 sm:mb-7">
                <h2 className="text-center text-[#1e293b] font-bold text-lg sm:text-[19px] mb-3.5 tracking-wide">
                  {SHUBHAM_BIODATA.personalTitle}
                </h2>
                <div className="max-w-[490px] mx-auto">
                  <div className="grid grid-cols-[135px_20px_1fr] sm:grid-cols-[145px_24px_1fr] text-[15px] sm:text-[15.5px] leading-[1.6] text-[#1e293b] font-medium gap-y-2 sm:gap-y-2.5">
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
              <section className="mb-6 sm:mb-7">
                <h2 className="text-center text-[#1e293b] font-bold text-lg sm:text-[19px] mb-3.5 tracking-wide">
                  {SHUBHAM_BIODATA.familyTitle}
                </h2>
                <div className="max-w-[490px] mx-auto">
                  <div className="grid grid-cols-[135px_20px_1fr] sm:grid-cols-[145px_24px_1fr] text-[15px] sm:text-[15.5px] leading-[1.6] text-[#1e293b] font-medium gap-y-2 sm:gap-y-2.5">
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
                <h2 className="text-center text-[#1e293b] font-bold text-lg sm:text-[19px] mb-3.5 tracking-wide">
                  {SHUBHAM_BIODATA.contactTitle}
                </h2>
                <div className="max-w-[490px] mx-auto flex flex-col gap-3 text-center">
                  {SHUBHAM_BIODATA.contacts.map((contact, idx) => (
                    <div key={idx} className="text-[14.5px] sm:text-[15px] leading-[1.5] text-[#1e293b]">
                      <div className="font-medium">
                        {contact.name}, {contact.place}
                      </div>
                      <div className="font-medium tracking-wide">
                        <a
                          href={`tel:${contact.phoneClean}`}
                          className="inline-flex items-center justify-center gap-1 hover:text-[#b94c2e] hover:underline transition-colors mt-0.5"
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

            {/* Quick Link to Groom Photo */}
            <div className="no-print text-center pt-2 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 hover:bg-white text-rose-800 text-xs font-bold border border-rose-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4 text-rose-600" />
                <span>📸 चि. शुभम खर्चे यांचा फोटो पाहण्यासाठी येथे क्लिक करा 👉</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Separate Groom Photo Card */}
        {activeTab === 'photo' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-[#d8c9bd] shadow-md p-6 sm:p-8 text-center max-w-[560px] mx-auto">
              <div className="mb-5">
                <span className="text-[11px] font-bold tracking-[0.25em] text-rose-800 uppercase block mb-1">
                  ॥ श्री गणेशाय नमः ॥
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                  चि. शुभम अनिल खर्चे
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  विवाह परिचय वर फोटो • स्वतंत्र फोटो दृश्य
                </p>
              </div>

              {groomPhoto ? (
                <div className="space-y-5">
                  {/* Photo Container */}
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative group max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={groomPhoto}
                      alt="चि. शुभम अनिल खर्चे"
                      className="w-full h-auto max-h-[480px] object-cover object-top mx-auto"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white font-bold text-xs">
                      <Eye className="w-6 h-6" />
                      <span>पूर्ण स्क्रीनमध्ये मोठा फोटो पहा</span>
                    </div>
                  </div>

                  {/* Dedicated Action Buttons for Photo */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>👁️ मोठा फोटो पहा</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPhoto}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-rose-600/25 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>⬇️ फोटो डाऊनलोड</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSharePhoto}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>📤 फोटो शेअर</span>
                    </button>

                    {isAdminAuthenticated && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenPhotoManager}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>📸 फोटो / लिंक बदला</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border border-red-200 cursor-pointer"
                          title="फोटो किंवा लिंक काढून टाका"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>काढून टाका</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    डाऊनलोड नाव: <code>Shubham-Kharche-Photo.jpg</code>
                  </p>
                </div>
              ) : (
                <div className="py-12 px-4 space-y-4 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/40">
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      अद्याप वर फोटो अपलोड केलेला नाही
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Google Drive शेअरिंग लिंक किंवा गॅलरीतून शुभम यांचा फोटो जोडा.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleOpenPhotoManager}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isAdminAuthenticated ? '📸 फोटो किंवा Google Drive लिंक जोडा' : '🔐 ॲडमिन लॉगिन व फोटो जोडा'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Switch back to Patrika */}
            <div className="text-center pt-2 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('biodata')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 hover:bg-white text-rose-800 text-xs font-bold border border-rose-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>👈 संपूर्ण विवाह परिचय पत्रिका (बायोडाटा) पहा</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Full-screen Photo Zoom Modal */}
      {isLightboxOpen && groomPhoto && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[100001] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-3 shadow-2xl overflow-hidden"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={groomPhoto}
                alt="चि. शुभम अनिल खर्चे"
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
            </div>
            <div className="mt-3 flex items-center justify-between px-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">चि. शुभम अनिल खर्चे</span>
                <span className="text-[11px] text-slate-500">वर फोटो • Shubham-Kharche-Photo.jpg</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPhoto}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाऊनलोड</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Groom Photo Upload / Management Bottom Sheet */}
      <GroomPhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentPhoto={groomPhoto}
        onSavePhoto={handleSavePhoto}
        onRemovePhoto={handleRemovePhoto}
      />
    </div>
  );
};

export const GroomProfilePage = React.memo(GroomProfilePageComponent);
