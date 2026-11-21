import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Share2,
  Phone,
  MessageCircle,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Heart,
  Briefcase,
  Users,
  Compass,
  Target,
  Smile,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SHUBHAM_BIODATA } from '../constants/shubhamBiodataData';
import { subscribeGroomPhotos } from '../services/groomProfileService';

interface GroomAboutPageProps {
  onBackToPortal?: () => void;
  onOpenGroomProfile?: () => void;
  isTabMode?: boolean;
}

export const GroomAboutPage: React.FC<GroomAboutPageProps> = ({
  onBackToPortal,
  onOpenGroomProfile,
  isTabMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [groomPhotos, setGroomPhotos] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeGroomPhotos((photos) => {
      setGroomPhotos(photos);
    });
    return () => unsubscribe();
  }, []);

  const primaryPhoto = groomPhotos[0] || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const getAboutUrl = () => {
    if (typeof window === 'undefined') return 'https://anubandhlsm.web.app/about';
    return `${window.location.origin}/about`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getAboutUrl());
      setCopied(true);
      showToast('✅ लिंक कॉपी झाली!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('⚠️ लिंक कॉपी करता आली नाही');
    }
  };

  const handleShareWhatsApp = () => {
    const shareUrl = getAboutUrl();
    const text = `*चि. शुभम अनिल खर्चे - माझ्याविषयी अधिक माहिती (About Me)*\n\n` +
      `नमस्कार, चि. शुभम खर्चे (Senior QA Engineer, Pune) यांच्याविषयी सविस्तर माहिती, स्वभाव, शिक्षण, करिअर, कौटुंबिक पार्श्वभूमी व भविष्यातील विचार जाणून घेण्यासाठी खालील लिंक पहा:\n\n` +
      `🔗 ${shareUrl}\n\n` +
      `धन्यवाद! 🙏`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const content = (
    <div className={`space-y-6 sm:space-y-8 animate-fade-in ${isTabMode ? 'w-full' : 'max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8'}`}>
      {/* Hero Card */}
      <div className="relative rounded-3xl bg-white border border-rose-100 shadow-lg shadow-rose-900/5 p-6 sm:p-8 overflow-hidden">
        {/* Background decorative gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-100/60 via-amber-100/40 to-transparent rounded-full -translate-y-24 translate-x-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-50 to-transparent rounded-full translate-y-20 -translate-x-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Groom Photo with badge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 ring-2 ring-rose-200">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt="चि. शुभम अनिल खर्चे"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-500 font-bold">
                  <User className="w-12 h-12 mb-1 opacity-70" />
                  <span className="text-xs">शुभम खर्चे</span>
                </div>
              )}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                वर परिचय
              </span>
            </div>
          </div>

          {/* Profile Intro Text */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>विवाह परिचय • वैयक्तिक माहिती</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              चि. शुभम अनिल खर्चे
            </h1>

            <p className="text-sm sm:text-base font-semibold text-rose-700">
              Senior QA Engineer • Shaurya Technosoft Pvt. Ltd., Pune
            </p>

            {/* Quick Spec Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                🎂 ३० वर्षे (२५ ऑगस्ट १९९६)
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                📏 ५' ६"
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                💰 ₹७.८ लाख वार्षिक
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                🎓 B.E. Mechanical
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                🏡 मूळ: शेळगाव बाजार (बुलढाणा)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* विभाग १: वैयक्तिक परिचय */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              १. वैयक्तिक परिचय
            </h2>
            <p className="text-xs text-slate-500 font-medium">माझे स्वतःबद्दलचे मनोगत</p>
          </div>
        </div>

        <div className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium space-y-3">
          <p>
            माझे नाव <strong>शुभम अनिल खर्चे</strong>. मी सध्या पुणे येथे वास्तव्यास असून एका खाजगी आयटी कंपनीमध्ये <strong>Senior QA Engineer</strong> म्हणून कार्यरत आहे.
          </p>
          <p className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-amber-950">
            मी साधा, समंजस, सकारात्मक विचारसरणीचा आणि कुटुंबाला महत्त्व देणारा व्यक्ती आहे. आयुष्यात स्वतःची प्रगती साधण्यासोबतच कुटुंबातील नातेसंबंध जपणे आणि प्रत्येकाशी आदराने वागणे याला मी सर्वोच्च महत्त्व देतो.
          </p>
        </div>
      </section>

      {/* विभाग २: वैयक्तिक माहिती (तक्ता स्वरूपात) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              २. वैयक्तिक माहिती
            </h2>
            <p className="text-xs text-slate-500 font-medium">जन्म, शिक्षण, करिअर व मूळ गाव तपशील</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">पूर्ण नाव</span>
            <span className="font-bold text-slate-900 text-right">शुभम अनिल खर्चे</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">जन्मतारीख</span>
            <span className="font-bold text-slate-900 text-right">२५ ऑगस्ट १९९६ (वय: ३० वर्षे)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">उंची व रक्तगट</span>
            <span className="font-bold text-slate-900 text-right">५ फूट ६ इंच • B+ve</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">शिक्षण</span>
            <span className="font-bold text-slate-900 text-right">B.E. Mechanical</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">व्यवसाय / हुद्दा</span>
            <span className="font-bold text-slate-900 text-right">Senior QA Engineer</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">कंपनी</span>
            <span className="font-bold text-slate-900 text-right">Shaurya Technosoft Pvt. Ltd.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <span className="text-emerald-800 font-medium">वार्षिक उत्पन्न</span>
            <span className="font-black text-emerald-800 text-right">₹७.८ लाख (7.8 LPA)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">सध्याचे वास्तव्य</span>
            <span className="font-bold text-slate-900 text-right">पुणे (Pune)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">गोत्र व मामकूळ</span>
            <span className="font-bold text-slate-900 text-right">वशिष्ठ • चोपडे (दाताळा)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">मूळ गाव</span>
            <span className="font-bold text-slate-900 text-right">शेळगाव बाजार, ता. मोताळा, जि. बुलढाणा</span>
          </div>
        </div>
      </section>

      {/* विभाग ३: शैक्षणिक व व्यावसायिक माहिती */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ३. शैक्षणिक व व्यावसायिक माहिती
            </h2>
            <p className="text-xs text-slate-500 font-medium">अभियांत्रिकी शिक्षण व आयटी क्षेत्रातील वाटचाल</p>
          </div>
        </div>

        <div className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium space-y-3">
          <p>
            मी <strong>Mechanical Engineering</strong> मध्ये पदवी (B.E.) प्राप्त केली आहे. त्यानंतर IT क्षेत्रात करिअरची सुरुवात करून सध्या <strong>Software Testing आणि Quality Assurance</strong> क्षेत्रात कार्यरत आहे.
          </p>
          <p>
            नवीन तंत्रज्ञान शिकणे, स्वतःच्या कौशल्यांमध्ये सुधारणा करणे आणि व्यावसायिक क्षेत्रात सातत्याने प्रगती करणे यामध्ये मला विशेष रस आहे.
          </p>
        </div>
      </section>

      {/* विभाग ४: कौटुंबिक पार्श्वभूमी */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ४. कौटुंबिक पार्श्वभूमी
            </h2>
            <p className="text-xs text-slate-500 font-medium">संस्कार, कौटुंबिक मूल्ये व नातेसंबंध</p>
          </div>
        </div>

        <div className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium space-y-4">
          <p>
            आमचे कुटुंब मूळचे <strong>शेळगाव बाजार, तालुका मोताळा, जिल्हा बुलढाणा</strong> येथील आहे. आमची कौटुंबिक पार्श्वभूमी शेतीशी संबंधित असून ग्रामीण संस्कार आणि कौटुंबिक मूल्यांना आमच्या कुटुंबात विशेष महत्त्व आहे.
          </p>
          <p>
            कुटुंबातील नातेसंबंध, परस्पर आदर, विश्वास आणि एकमेकांना समजून घेणे या गोष्टींना मी महत्त्व देतो.
          </p>

          {/* Quick Family Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">वडिलांचे नाव</span>
              <span className="font-bold text-slate-800">कै. अनिल पुंजाजी खर्चे</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">आईचे नाव</span>
              <span className="font-bold text-slate-800">श्रीमती अनिता अनिल खर्चे</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">शेती</span>
              <span className="font-bold text-slate-800">५.५ एकर (शेळगाव बाजार)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">बहीण</span>
              <span className="font-bold text-slate-800">२ विवाहित बहिणी</span>
            </div>
          </div>
        </div>
      </section>

      {/* विभाग ५: स्वभाव व व्यक्तिमत्त्व */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ५. स्वभाव व व्यक्तिमत्त्व
            </h2>
            <p className="text-xs text-slate-500 font-medium">माझे स्वभाववैशिष्ट्ये व विचारसरणी</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <span>साधा, शांत आणि समंजस स्वभाव.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <span>नवीन गोष्टी शिकण्याची आणि स्वतःमध्ये सुधारणा करण्याची आवड.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <span>कुटुंब आणि नातेसंबंधांना महत्त्व देणारा.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <span>जबाबदारीने वागण्यावर विश्वास.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <span>आधुनिक विचारसरणी आणि पारंपरिक मूल्यांचा समतोल राखण्याचा प्रयत्न.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-bold text-emerald-900">निर्व्यसनी (धूम्रपान व मद्यपान करत नाही).</span>
          </div>
        </div>
      </section>

      {/* विभाग ६: आवडी-निवडी व जीवनशैली */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ६. आवडी-निवडी
            </h2>
            <p className="text-xs text-slate-500 font-medium">छंद व मोकळ्या वेळेतील आवडत्या गोष्टी</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="text-xl">💻</span>
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">तंत्रज्ञान व डिजिटल घडामोडी</span>
              <span className="text-xs text-slate-600">नवीन तंत्रज्ञान आणि डिजिटल क्षेत्रातील गोष्टी जाणून घेणे.</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="text-xl">📚</span>
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">वाचन व अभ्यास</span>
              <span className="text-xs text-slate-600">वाचन आणि नवीन विषयांचा अभ्यास करणे.</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="text-xl">🌄</span>
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">पर्यटन व निसर्गभ्रमंती</span>
              <span className="text-xs text-slate-600">पर्यटन आणि नवीन ठिकाणांना भेट देणे.</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">कौशल्य विकास</span>
              <span className="text-xs text-slate-600">वैयक्तिक विकास आणि नवीन कौशल्ये आत्मसात करणे.</span>
            </div>
          </div>
        </div>
      </section>

      {/* विभाग ७: भविष्यातील ध्येय व विचार */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ७. भविष्यातील ध्येय व विचार
            </h2>
            <p className="text-xs text-slate-500 font-medium">करिअर व वैयक्तिक आयुष्याचा दृष्टिकोन</p>
          </div>
        </div>

        <div className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium space-y-3">
          <p>
            करिअरमध्ये सातत्याने प्रगती करताना वैयक्तिक आयुष्यातही स्थैर्य आणि आनंद टिकवून ठेवण्याची माझी प्रामाणिक इच्छा आहे.
          </p>
          <p className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-emerald-950 font-semibold">
            विवाहानंतर दोघांनी एकमेकांच्या स्वप्नांना, करिअरला आणि विचारांना पाठिंबा देत परस्पर सहकार्याने आयुष्याची वाटचाल करावी, असे मला वाटते.
          </p>
        </div>
      </section>

      {/* विभाग ८: अपेक्षित जीवनसाथी */}
      <section className="rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-rose-100/30 border-2 border-rose-200 shadow-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-rose-200/80">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-rose-950">
              ८. अपेक्षित जीवनसाथी
            </h2>
            <p className="text-xs text-rose-700 font-medium">जीवनसाथीकडून माझ्या अपेक्षा व दृष्टिकोन</p>
          </div>
        </div>

        <div className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium space-y-3">
          <p className="text-base sm:text-lg font-bold text-rose-900 italic">
            "जीवनसाथी ही केवळ आयुष्याची जोडीदार नसून एक चांगली मैत्रीण आणि सहप्रवासी असावी, अशी माझी अपेक्षा आहे."
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-white/80 border border-rose-100 flex items-start gap-3 shadow-sm">
              <span className="text-rose-600 font-black">🌸</span>
              <span>समंजस, मनमोकळा आणि सकारात्मक दृष्टिकोन असलेली.</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 border border-rose-100 flex items-start gap-3 shadow-sm">
              <span className="text-rose-600 font-black">🌸</span>
              <span>कौटुंबिक नात्यांचा आदर करणारी.</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 border border-rose-100 flex items-start gap-3 shadow-sm">
              <span className="text-rose-600 font-black">🌸</span>
              <span>एकमेकांचे विचार आणि मतांचा आदर करणारी.</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 border border-rose-100 flex items-start gap-3 shadow-sm">
              <span className="text-rose-600 font-black">🌸</span>
              <span>आयुष्यातील चांगल्या-वाईट प्रसंगांत एकमेकांना खंबीर साथ देणारी.</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 border border-rose-100 flex items-start gap-3 shadow-sm">
              <span className="text-rose-600 font-black">🌸</span>
              <span>स्वतःची स्वप्ने, आवडी आणि ध्येये जपणारी.</span>
            </div>
          </div>
        </div>
      </section>

      {/* विभाग ९: संपर्क माहिती */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-white/15">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              ९. आमच्याशी संपर्क साधा
            </h2>
            <p className="text-xs text-slate-400 font-medium">पालक व कौटुंबिक संपर्क तपशील</p>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
          आपणास वरील माहिती योग्य वाटल्यास आणि पुढील चर्चा करण्याची इच्छा असल्यास कृपया खालील क्रमांकांवर संपर्क साधावा.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SHUBHAM_BIODATA.contacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="font-bold text-white text-sm">{contact.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{contact.place}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <a
                  href={`tel:${contact.phoneClean}`}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>कॉल करा</span>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=91${contact.phoneClean}&text=${encodeURIComponent('नमस्कार, आम्ही चि. शुभम खर्चे यांच्या विवाहाच्या संदर्भाने संपर्क करत आहोत.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="व्हॉट्सॲप मेसेज पाठवा"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>व्हॉट्सॲप</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Footer Links */}
        <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>धन्यवाद! 🙏</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenGroomProfile}
              className="text-rose-400 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>📄 मूळ विवाह पत्रिका पहा</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Switch Card (Standalone page only) */}
      {!isTabMode && (
        <div className="p-4 rounded-2xl bg-white border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-center sm:text-left">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">मूळ विवाह पत्रिका पाहायची आहे का?</h4>
            <p className="text-xs text-slate-500 mt-0.5">पारंपरिक नक्षीकाम व पत्रिकेसह डाऊनलोड पर्याय उपलब्ध आहे.</p>
          </div>
          <button
            type="button"
            onClick={onOpenGroomProfile}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-800 to-rose-700 hover:from-rose-900 hover:to-rose-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>📄 विवाह पत्रिका पहा</span>
          </button>
        </div>
      )}
    </div>
  );

  if (isTabMode) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-slate-50 to-amber-50/40 text-slate-800 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-4 border border-white/10">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Action Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200/80"
            title="पुस्तिका पहा"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">📖 पुस्तिका पहा</span>
            <span className="sm:hidden">पुस्तिका</span>
          </button>

          {/* Quick Switch to Main Biodata Patrika */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGroomProfile}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-800 hover:text-white bg-rose-50 hover:bg-rose-800 px-3 py-1.5 rounded-xl transition-all border border-rose-200 shadow-sm"
              title="मूळ विवाह पत्रिका पहा"
            >
              <FileText className="w-4 h-4" />
              <span>📄 विवाह पत्रिका</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm shadow-emerald-600/30"
              title="व्हॉट्सॲपवर शेअर करा"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">शेअर करा</span>
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="लिंक कॉपी करा"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main>
        {content}
      </main>
    </div>
  );
};
