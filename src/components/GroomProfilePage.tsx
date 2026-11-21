import React, { useState, useEffect } from 'react';
import { GroomAboutPage } from './GroomAboutPage';
import {
  Phone,
  Share2,
  ArrowLeft,
  Download,
  Camera,
  FileText,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Sparkles
} from 'lucide-react';
import { getBiodataUrl, buildGenericShareMessage } from '../utils/messages';
import { SHUBHAM_BIODATA, GANESH_IMG_DATA } from '../constants/shubhamBiodataData';
import {
  getGeneratedBiodataImage,
  downloadBiodataCanvasImage
} from '../utils/biodataCanvasGenerator';
import {
  subscribeGroomPhotos,
  addGroomPhoto,
  removeGroomPhotoAtIndex,
  setPrimaryGroomPhoto,
  clearAllGroomPhotos,
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
  const [activeTab, setActiveTab] = useState<'biodata' | 'photo' | 'about'>('biodata');
  const [groomPhotos, setGroomPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Subscribe to real-time groom photos list (local cache + Firebase cloud sync)
  useEffect(() => {
    const unsubscribe = subscribeGroomPhotos((photos) => {
      setGroomPhotos(photos);
      setActivePhotoIndex((prev) => {
        if (photos.length === 0) return 0;
        return prev >= photos.length ? photos.length - 1 : prev;
      });
    });
    return () => unsubscribe();
  }, []);

  const activePhoto = groomPhotos[activePhotoIndex] || groomPhotos[0] || null;

  const handlePrevPhoto = () => {
    if (groomPhotos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : groomPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    if (groomPhotos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev < groomPhotos.length - 1 ? prev + 1 : 0));
  };

  // Runtime dynamic URL computation
  const dynamicProfileUrl = getBiodataUrl();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 1800);
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

  // 2. Separate Photo Handlers (Shubham-Kharche-Photo.jpg)
  const handleDownloadPhoto = () => {
    if (!activePhoto) return;
    const filename = groomPhotos.length > 1
      ? `Shubham-Kharche-Photo-${activePhotoIndex + 1}.jpg`
      : 'Shubham-Kharche-Photo.jpg';
    downloadGroomPhotoImage(activePhoto, filename);
    showToast(`✅ वर फोटो (${filename}) डाऊनलोड झाला!`);
  };

  const handleSharePhoto = async () => {
    if (!activePhoto) return;
    const title = groomPhotos.length > 1
      ? `चि. शुभम अनिल खर्चे - वर फोटो (${activePhotoIndex + 1}/${groomPhotos.length})`
      : 'चि. शुभम अनिल खर्चे - वर फोटो';
    const success = await shareGroomPhotoImage(activePhoto, title);
    if (success) {
      showToast('✅ वर फोटो शेअर झाला!');
    } else {
      showToast('⚠️ फोटो शेअर करता आला नाही');
    }
  };

  // 3. Multi-Photo Management Handlers
  const handleAddPhoto = async (photoUrl: string) => {
    try {
      await addGroomPhoto(photoUrl);
      showToast('✅ नवीन फोटो गॅलरीत जोडला!');
    } catch {
      showToast('⚠️ फोटो जोडताना त्रुटी आली.');
    }
  };

  const handleRemovePhotoAtIndex = async (index: number) => {
    try {
      await removeGroomPhotoAtIndex(index);
      showToast('✅ फोटो काढून टाकला!');
    } catch {
      showToast('⚠️ फोटो काढताना त्रुटी आली.');
    }
  };

  const handleSetPrimaryPhoto = async (index: number) => {
    try {
      await setPrimaryGroomPhoto(index);
      setActivePhotoIndex(0);
      showToast('⭐ हा फोटो मुख्य फोटो म्हणून सेट केला!');
    } catch {
      showToast('⚠️ मुख्य फोटो सेट करताना त्रुटी आली.');
    }
  };

  const handleClearAllPhotos = async () => {
    try {
      await clearAllGroomPhotos();
      setActivePhotoIndex(0);
      showToast('✅ सर्व फोटो काढून टाकले!');
    } catch {
      showToast('⚠️ फोटो काढताना त्रुटी आली.');
    }
  };

  const handleOpenPhotoManager = () => {
    if (isAdminAuthenticated) {
      setIsUploadModalOpen(true);
    } else if (onAdminLoginRequest) {
      onAdminLoginRequest('वर फोटो व्यवस्थापनासाठी ॲडमिन पासवर्ड आवश्यक आहे.');
    } else {
      setIsUploadModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#eeeae5] py-4 sm:py-8 px-2 sm:px-4 font-sans text-[#343434] pb-10 print:pb-0 print:bg-white print:p-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] bg-[#1e293b] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xl transition-all duration-200 animate-fade-in text-center max-w-[90%] pointer-events-none">
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
              <span>📖 पुस्तिका पहा</span>
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
            ) : activeTab === 'photo' ? (
              <>
                {activePhoto && (
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
                      title="फोटो डाऊनलोड करा"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">फोटो डाऊनलोड</span>
                    </button>
                  </>
                )}

                {/* Admin Add/Manage Photos Button */}
                <button
                  type="button"
                  onClick={handleOpenPhotoManager}
                  className="px-3 h-9 sm:h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-90 cursor-pointer text-xs font-bold"
                  title="वर फोटो गॅलरी व्यवस्थापन"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{groomPhotos.length > 0 ? 'फोटो जोडा / व्यवस्थापन' : 'फोटो जोडा'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const text = `*चि. शुभम अनिल खर्चे - माझ्याविषयी अधिक माहिती (About Me)*\n\n` +
                      `नमस्कार, चि. शुभम खर्चे (Senior QA Engineer, Pune) यांच्याविषयी सविस्तर माहिती, स्वभाव, शिक्षण, करिअर, कौटुंबिक पार्श्वभूमी व भविष्यातील विचार जाणून घेण्यासाठी खालील लिंक पहा:\n\n` +
                      `🔗 ${window.location.origin}/profile\n\n` +
                      `धन्यवाद! 🙏`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-3 h-9 sm:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-90 cursor-pointer text-xs font-bold"
                  title="माझ्याविषयी माहिती शेअर करा"
                >
                  <Share2 className="w-4 h-4" />
                  <span>शेअर करा</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Tab Switcher: Separate Biodata vs Photo vs About Me */}
        <div className="no-print grid grid-cols-3 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#d8c9bd] shadow-xs text-xs sm:text-sm font-bold gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'biodata'
                ? 'bg-gradient-to-r from-rose-800 to-rose-700 text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">विवाह पत्रिका</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-gradient-to-r from-rose-800 to-rose-700 text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Camera className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              वर फोटो {groomPhotos.length > 0 ? `(${groomPhotos.length})` : ''}
            </span>
            {groomPhotos.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-rose-800 to-rose-700 text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span className="truncate">माझ्याविषयी</span>
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

            {/* Quick Links to Groom Photo and About Me */}
            <div className="no-print flex flex-wrap items-center justify-center gap-2 pt-2 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-rose-800 text-xs sm:text-sm font-bold border border-rose-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4 text-rose-600" />
                <span>📸 वर फोटो पहा</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs sm:text-sm font-bold border border-rose-200 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>✨ माझ्याविषयी अधिक माहिती वाचा 👉</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Dedicated Groom Photos Gallery */}
        {activeTab === 'photo' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white border-2 border-[#222222] shadow-[0_10px_32px_rgba(45,35,25,0.12)] rounded-3xl p-4 sm:p-7 text-center space-y-4 relative">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold tracking-[0.25em] text-rose-800 uppercase block mb-1">
                  ॥ श्री गणेशाय नमः ॥
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                  चि. शुभम अनिल खर्चे
                </h2>
                <p className="text-xs text-rose-700 font-semibold tracking-wide mt-0.5">
                  विवाह परिचय वर फोटो गॅलरी {groomPhotos.length > 0 && `• ${groomPhotos.length} फोटो`}
                </p>
              </div>

              {groomPhotos.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Photo Container with Prev/Next Navigation */}
                  <div className="relative group max-w-[360px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
                    <div
                      onClick={() => setIsLightboxOpen(true)}
                      className="cursor-pointer relative aspect-[3/4] flex items-center justify-center bg-black"
                    >
                      <img
                        src={activePhoto || groomPhotos[0]}
                        alt={`चि. शुभम अनिल खर्चे - फोटो ${activePhotoIndex + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white font-bold text-xs pointer-events-none">
                        <Eye className="w-6 h-6" />
                        <span>पूर्ण स्क्रीनमध्ये मोठा फोटो पहा</span>
                      </div>
                    </div>

                    {/* Photo Counter Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                      <span>{activePhotoIndex + 1} / {groomPhotos.length}</span>
                      {activePhotoIndex === 0 && (
                        <span className="text-amber-300 flex items-center gap-0.5 ml-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>मुख्य</span>
                        </span>
                      )}
                    </div>

                    {/* Floating Prev / Next Buttons */}
                    {groomPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevPhoto();
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="मागील फोटो"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextPhoto();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="पुढील फोटो"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Horizontal Thumbnail Strip for Multiple Photos */}
                  {groomPhotos.length > 1 && (
                    <div className="flex items-center justify-center gap-2 max-w-sm mx-auto overflow-x-auto py-1 px-2">
                      {groomPhotos.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActivePhotoIndex(i)}
                          className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                            i === activePhotoIndex
                              ? 'border-rose-600 scale-105 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
                              : 'border-slate-300 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover object-top" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons for Active Photo */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>👁️ मोठा फोटो पहा</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPhoto}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-rose-600/25 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>⬇️ फोटो डाऊनलोड</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSharePhoto}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-600/25 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>📤 फोटो शेअर</span>
                    </button>

                    {isAdminAuthenticated && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleOpenPhotoManager}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                          title="आणखी फोटो जोडा किंवा व्यवस्थापन करा"
                        >
                          <Plus className="w-4 h-4 text-rose-600" />
                          <span>फोटो जोडा / व्यवस्थापन</span>
                        </button>

                        {activePhotoIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(activePhotoIndex)}
                            className="px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 border border-amber-200 cursor-pointer"
                            title="हा फोटो मुख्य फोटो बनवा"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>मुख्य करा</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemovePhotoAtIndex(activePhotoIndex)}
                          className="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 border border-red-200 cursor-pointer"
                          title="हा फोटो काढून टाका"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>काढा</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    डाऊनलोड नाव: <code>{groomPhotos.length > 1 ? `Shubham-Kharche-Photo-${activePhotoIndex + 1}.jpg` : 'Shubham-Kharche-Photo.jpg'}</code>
                  </p>
                </div>
              ) : (
                /* Empty State */
                <div className="py-12 px-4 space-y-4 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/40">
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      अद्याप वर फोटो जोडलेला नाही
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Google Drive शेअरिंग लिंक किंवा गॅलरीतून शुभम यांचे एकापेक्षा जास्त फोटो जोडा.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleOpenPhotoManager}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAdminAuthenticated ? '📸 फोटो जोडा (Multiple Photos)' : '🔐 ॲडमिन लॉगिन व फोटो जोडा'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Switch back to Patrika or About Me */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('biodata')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-rose-800 text-xs sm:text-sm font-bold border border-rose-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>👈 संपूर्ण विवाह पत्रिका पहा</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs sm:text-sm font-bold border border-rose-200 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>✨ माझ्याविषयी अधिक माहिती वाचा 👉</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3 Content: माझ्याविषयी अधिक माहिती (About Me) */}
        {activeTab === 'about' && (
          <div className="space-y-4 animate-fade-in">
            <GroomAboutPage
              isTabMode={true}
              onBackToPortal={onBackToPortal}
              onOpenGroomProfile={() => setActiveTab('biodata')}
            />
          </div>
        )}
      </div>

      {/* Lightbox / Full-screen Photo Zoom Modal with Slider */}
      {isLightboxOpen && activePhoto && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[100001] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-white rounded-3xl p-3 shadow-2xl overflow-hidden"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[3/4] flex items-center justify-center">
              <img
                src={activePhoto}
                alt={`चि. शुभम अनिल खर्चे - ${activePhotoIndex + 1}`}
                className="w-full h-full object-contain mx-auto"
              />

              {/* Lightbox Prev / Next Controls */}
              {groomPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    title="मागील फोटो"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    title="पुढील फोटो"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo Indicator */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold">
                फोटो {activePhotoIndex + 1} / {groomPhotos.length}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">चि. शुभम अनिल खर्चे</span>
                <span className="text-[11px] text-slate-500">
                  वर फोटो • {groomPhotos.length > 1 ? `फोटो ${activePhotoIndex + 1} / ${groomPhotos.length}` : 'Shubham-Kharche-Photo.jpg'}
                </span>
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
        currentPhotos={groomPhotos}
        onAddPhoto={handleAddPhoto}
        onRemovePhotoAtIndex={handleRemovePhotoAtIndex}
        onSetPrimaryPhoto={handleSetPrimaryPhoto}
        onClearAllPhotos={handleClearAllPhotos}
      />
    </div>
  );
};

export const GroomProfilePage = React.memo(GroomProfilePageComponent);
