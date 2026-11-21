import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Share2,
  Phone,
  MessageCircle,
  Copy,
  Check,
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
  const [lang, setLang] = useState<'mr' | 'en'>('mr');
  const [copied, setCopied] = useState(false);
  const [copiedFullText, setCopiedFullText] = useState(false);
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
    }, 1800);
  };

  const getAboutUrl = () => {
    if (typeof window === 'undefined') return 'https://anubandhlsm.web.app/about';
    return `${window.location.origin}/about`;
  };

  // Exact Marathi text provided by user
  const getMarathiFullMessage = () => {
    const shareUrl = getAboutUrl();
    return `*माझ्याविषयी*\n\n` +
      `*चि. शुभम अनिल खर्चे*\n` +
      `विवाह परिचय | वैयक्तिक माहिती\n\n` +
      `*१. वैयक्तिक परिचय*\n\n` +
      `माझे नाव शुभम अनिल खर्चे. मी सध्या पुणे येथे वास्तव्यास असून एका खाजगी आयटी कंपनीमध्ये Senior QA Engineer म्हणून कार्यरत आहे.\n\n` +
      `मी साधा, समंजस, सकारात्मक विचारसरणीचा आणि कुटुंबाला महत्त्व देणारा व्यक्ती आहे. आयुष्यात स्वतःची प्रगती साधण्यासोबतच कुटुंबातील नातेसंबंध जपणे आणि प्रत्येकाशी आदराने वागणे याला मी महत्त्व देतो.\n\n` +
      `*२. वैयक्तिक माहिती*\n\n` +
      `• पूर्ण नाव: शुभम अनिल खर्चे\n` +
      `• जन्मतारीख: २५ ऑगस्ट १९९६\n` +
      `• वय: ३० वर्षे\n` +
      `• उंची: ५ फूट ६ इंच\n` +
      `• शिक्षण: B.E. Mechanical\n` +
      `• व्यवसाय: Senior QA Engineer\n` +
      `• कंपनी: Shaurya Technosoft Pvt. Ltd.\n` +
      `• वार्षिक उत्पन्न: ₹७.८ लाख\n` +
      `• सध्याचे वास्तव्य: पुणे\n` +
      `• मूळ गाव: शेळगाव बाजार, ता. मोताळा, जि. बुलढाणा\n\n` +
      `*३. शैक्षणिक व व्यावसायिक माहिती*\n\n` +
      `मी Mechanical Engineering मध्ये पदवी प्राप्त केली आहे. त्यानंतर IT क्षेत्रात करिअरची सुरुवात करून सध्या Software Testing आणि Quality Assurance क्षेत्रात कार्यरत आहे.\n\n` +
      `नवीन तंत्रज्ञान शिकणे, स्वतःच्या कौशल्यांमध्ये सुधारणा करणे आणि व्यावसायिक क्षेत्रात सातत्याने प्रगती करणे यामध्ये मला विशेष रस आहे.\n\n` +
      `*४. कौटुंबिक पार्श्वभूमी*\n\n` +
      `आमचे कुटुंब मूळचे शेळगाव बाजार, तालुका मोताळा, जिल्हा बुलढाणा येथील आहे. आमची कौटुंबिक पार्श्वभूमी शेतीशी संबंधित असून ग्रामीण संस्कार आणि कौटुंबिक मूल्यांना आमच्या कुटुंबात महत्त्व आहे.\n\n` +
      `कुटुंबातील नातेसंबंध, परस्पर आदर, विश्वास आणि एकमेकांना समजून घेणे या गोष्टींना मी महत्त्व देतो.\n\n` +
      `*५. स्वभाव व व्यक्तिमत्त्व*\n\n` +
      `• साधा, शांत आणि समंजस स्वभाव.\n` +
      `• नवीन गोष्टी शिकण्याची आणि स्वतःमध्ये सुधारणा करण्याची आवड.\n` +
      `• कुटुंब आणि नातेसंबंधांना महत्त्व देणारा.\n` +
      `• जबाबदारीने वागण्यावर विश्वास.\n` +
      `• आधुनिक विचारसरणी आणि पारंपरिक मूल्यांचा समतोल राखण्याचा प्रयत्न.\n` +
      `• निर्व्यसनी (धूम्रपान व मद्यपान करत नाही).\n\n` +
      `*६. आवडी-निवडी*\n\n` +
      `• नवीन तंत्रज्ञान आणि डिजिटल क्षेत्रातील गोष्टी जाणून घेणे.\n` +
      `• वाचन आणि नवीन विषयांचा अभ्यास करणे.\n` +
      `• पर्यटन आणि नवीन ठिकाणांना भेट देणे.\n` +
      `• वैयक्तिक विकास आणि नवीन कौशल्ये आत्मसात करणे.\n\n` +
      `*७. भविष्यातील ध्येय व विचार*\n\n` +
      `करिअरमध्ये सातत्याने प्रगती करताना वैयक्तिक आयुष्यातही स्थैर्य आणि आनंद टिकवून ठेवण्याची इच्छा आहे.\n\n` +
      `विवाहानंतर दोघांनी एकमेकांच्या स्वप्नांना, करिअरला आणि विचारांना पाठिंबा देत परस्पर सहकार्याने आयुष्याची वाटचाल करावी, असे मला वाटते.\n\n` +
      `*८. अपेक्षित जीवनसाथी*\n\n` +
      `जीवनसाथी ही केवळ आयुष्याची जोडीदार नसून एक चांगली मैत्रीण आणि सहप्रवासी असावी, अशी अपेक्षा आहे.\n\n` +
      `• समंजस, मनमोकळा आणि सकारात्मक दृष्टिकोन असलेली.\n` +
      `• कौटुंबिक नात्यांचा आदर करणारी.\n` +
      `• एकमेकांचे विचार आणि मतांचा आदर करणारी.\n` +
      `• आयुष्यातील चांगल्या-वाईट प्रसंगांत एकमेकांना साथ देणारी.\n` +
      `• स्वतःची स्वप्ने, आवडी आणि ध्येये जपणारी.\n\n` +
      `*९. आमच्याशी संपर्क साधा*\n\n` +
      `आपणास वरील माहिती योग्य वाटल्यास आणि पुढील चर्चा करण्याची इच्छा असल्यास कृपया संपर्क साधावा.\n\n` +
      `• चि. शुभम खर्चे (स्वतः): 8669145534\n` +
      `• श्री. श्रीराम खर्चे (काका): 9765270634\n` +
      `• श्री. श्रीकृष्ण खर्चे (काका): 9423447990\n\n` +
      `🔗 सविस्तर प्रोफाइल व फोटो पहा: ${shareUrl}\n\n` +
      `धन्यवाद! 🙏`;
  };

  // English version
  const getEnglishFullMessage = () => {
    const shareUrl = getAboutUrl();
    return `*About Me*\n\n` +
      `*Shubham Anil Kharche*\n` +
      `Matrimonial Profile | Personal Information\n\n` +
      `*1. Personal Introduction*\n\n` +
      `My name is Shubham Anil Kharche. I currently live in Pune and work as a Senior QA Engineer in a private IT company.\n\n` +
      `I am a simple, understanding, and positive-minded person with strong family values. Along with achieving personal growth in life, I give prime importance to nurturing family relationships and treating everyone with respect.\n\n` +
      `*2. Personal Details*\n\n` +
      `• Full Name: Shubham Anil Kharche\n` +
      `• Date of Birth: 25 August 1996\n` +
      `• Age: 30 Years\n` +
      `• Height: 5 ft 6 in\n` +
      `• Education: B.E. Mechanical\n` +
      `• Occupation: Senior QA Engineer\n` +
      `• Company: Shaurya Technosoft Pvt. Ltd.\n` +
      `• Annual Income: ₹7.8 Lakh\n` +
      `• Current Residence: Pune\n` +
      `• Native Place: Shelgaon Bazar, Tal. Motala, Dist. Buldhana\n\n` +
      `*3. Educational & Professional Background*\n\n` +
      `I completed my Bachelor's degree in Mechanical Engineering. Thereafter, I began my career in the IT industry and currently work in Software Testing and Quality Assurance.\n\n` +
      `I have a keen interest in learning new technologies, continuously upgrading my skills, and steadily advancing in my professional career.\n\n` +
      `*4. Family Background*\n\n` +
      `Our family originally hails from Shelgaon Bazar, Taluka Motala, District Buldhana. Our family background is connected to agriculture, and we deeply value rural cultural traditions and strong family values.\n\n` +
      `I value family relationships, mutual respect, trust, and understanding one another.\n\n` +
      `*5. Nature & Personality*\n\n` +
      `• Simple, calm, and understanding nature.\n` +
      `• Passion for learning new things and continuous self-improvement.\n` +
      `• Gives importance to family and relationships.\n` +
      `• Believes in acting responsibly.\n` +
      `• Strives to maintain a balance between modern mindset and traditional values.\n` +
      `• Teetotaler (does not smoke or drink).\n\n` +
      `*6. Hobbies & Interests*\n\n` +
      `• Exploring emerging technologies and digital advancements.\n` +
      `• Reading and studying diverse subjects.\n` +
      `• Traveling and visiting new places.\n` +
      `• Personal development and acquiring new skills.\n\n` +
      `*7. Future Goals & Thoughts*\n\n` +
      `While steadily progressing in my career, I desire to maintain stability and happiness in my personal life.\n\n` +
      `After marriage, I believe that both partners should support each other's dreams, careers, and thoughts, walking together through life with mutual cooperation.\n\n` +
      `*8. Partner Expectations*\n\n` +
      `Looking for a life partner who is not just a companion, but a good friend and fellow traveler in life's journey.\n\n` +
      `• Understanding, open-minded, and positive in outlook.\n` +
      `• Respectful of family relationships.\n` +
      `• Respectful of each other's thoughts and opinions.\n` +
      `• Supportive of each other through good and challenging times.\n` +
      `• Dedicated to nurturing her own dreams, interests, and goals.\n\n` +
      `*9. Contact Information*\n\n` +
      `If you find the above information suitable and wish to take discussions forward, please feel free to get in touch.\n\n` +
      `• Shubham Kharche (Self): 8669145534\n` +
      `• Shriram Kharche (Uncle): 9765270634\n` +
      `• Shrikrishna Kharche (Uncle): 9423447990\n\n` +
      `🔗 View full profile & photos: ${shareUrl}\n\n` +
      `Thank you! 🙏`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getAboutUrl());
      setCopied(true);
      showToast(lang === 'mr' ? '✅ लिंक कॉपी झाली!' : '✅ Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(lang === 'mr' ? '⚠️ लिंक कॉपी करता आली नाही' : '⚠️ Failed to copy link');
    }
  };

  const handleCopyFullText = async () => {
    try {
      const text = lang === 'mr' ? getMarathiFullMessage() : getEnglishFullMessage();
      await navigator.clipboard.writeText(text);
      setCopiedFullText(true);
      showToast(lang === 'mr' ? '✅ संपूर्ण मजकूर कॉपी झाला!' : '✅ Full text copied!');
      setTimeout(() => setCopiedFullText(false), 2000);
    } catch {
      showToast(lang === 'mr' ? '⚠️ मजकूर कॉपी करता आला नाही' : '⚠️ Failed to copy text');
    }
  };

  const handleShareWhatsApp = () => {
    const text = lang === 'mr' ? getMarathiFullMessage() : getEnglishFullMessage();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Language toggle switcher component
  const LanguageToggle = () => (
    <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-300">
      <button
        type="button"
        onClick={() => setLang('mr')}
        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
          lang === 'mr'
            ? 'bg-rose-800 text-white'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
        }`}
        title="मराठी मध्ये पहा"
      >
        <span>मराठी</span>
        <span className="text-[11px] opacity-80">(MR)</span>
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
          lang === 'en'
            ? 'bg-rose-800 text-white'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
        }`}
        title="View in English"
      >
        <span>English</span>
        <span className="text-[11px] opacity-80">(EN)</span>
      </button>
    </div>
  );

  const content = (
    <div className={`space-y-6 sm:space-y-7 ${isTabMode ? 'w-full' : 'max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6'}`}>
      {/* Title & Hero Section - Clean, solid card without special effects */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Photo */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt={lang === 'mr' ? 'चि. शुभम अनिल खर्चे' : 'Shubham Anil Kharche'}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-600 font-bold">
                  <User className="w-12 h-12 mb-1 opacity-70" />
                  <span className="text-xs sm:text-sm">{lang === 'mr' ? 'शुभम खर्चे' : 'Shubham Kharche'}</span>
                </div>
              )}
            </div>
            <span className="mt-2 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {lang === 'mr' ? 'वर परिचय' : 'Groom Profile'}
            </span>
          </div>

          {/* Heading */}
          <div className="flex-1 text-center sm:text-left space-y-2.5 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold">
                <Sparkles className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>{lang === 'mr' ? 'माझ्याविषयी' : 'About Me'}</span>
              </span>

              {/* Language Switcher */}
              <LanguageToggle />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
              {lang === 'mr' ? 'चि. शुभम अनिल खर्चे' : 'Shubham Anil Kharche'}
            </h1>

            <p className="text-base sm:text-lg font-bold text-rose-800 break-words">
              {lang === 'mr' ? 'विवाह परिचय | वैयक्तिक माहिती' : 'Matrimonial Profile | Personal Information'}
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-sm">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition-colors cursor-pointer text-sm sm:text-base"
              >
                <Share2 className="w-4 h-4 flex-shrink-0" />
                <span>{lang === 'mr' ? 'व्हॉट्सॲपवर शेअर करा' : 'Share on WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFullText}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-2 border border-slate-300 transition-colors cursor-pointer text-sm sm:text-base"
              >
                {copiedFullText ? <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0" />}
                <span>
                  {copiedFullText
                    ? (lang === 'mr' ? 'मजकूर कॉपी झाला!' : 'Copied!')
                    : (lang === 'mr' ? 'संपूर्ण मजकूर कॉपी करा' : 'Copy Full Text')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* १. वैयक्तिक परिचय */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '१. वैयक्तिक परिचय' : '1. Personal Introduction'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3.5 font-normal">
            <p className="break-words">
              माझे नाव शुभम अनिल खर्चे. मी सध्या पुणे येथे वास्तव्यास असून एका खाजगी आयटी कंपनीमध्ये Senior QA Engineer म्हणून कार्यरत आहे.
            </p>
            <p className="bg-amber-50/70 p-4 sm:p-5 rounded-xl border border-amber-200 text-slate-900 font-medium leading-relaxed break-words">
              मी साधा, समंजस, सकारात्मक विचारसरणीचा आणि कुटुंबाला महत्त्व देणारा व्यक्ती आहे. आयुष्यात स्वतःची प्रगती साधण्यासोबतच कुटुंबातील नातेसंबंध जपणे आणि प्रत्येकाशी आदराने वागणे याला मी महत्त्व देतो.
            </p>
          </div>
        ) : (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3.5 font-normal">
            <p className="break-words">
              My name is Shubham Anil Kharche. I currently live in Pune and work as a Senior QA Engineer in a private IT company.
            </p>
            <p className="bg-amber-50/70 p-4 sm:p-5 rounded-xl border border-amber-200 text-slate-900 font-medium leading-relaxed break-words">
              I am a simple, understanding, and positive-minded person with strong family values. Along with achieving personal growth in life, I give prime importance to nurturing family relationships and treating everyone with respect.
            </p>
          </div>
        )}
      </section>

      {/* २. वैयक्तिक माहिती */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '२. वैयक्तिक माहिती' : '2. Personal Details'}
          </h2>
        </div>

        {/* Exact Table - Clear, Large Font for Parents */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm sm:text-base border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-1/3 sm:w-1/4 font-extrabold">{lang === 'mr' ? 'तपशील' : 'Field'}</th>
                <th className="py-3.5 px-4 font-extrabold">{lang === 'mr' ? 'माहिती' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 break-words">
                  {lang === 'mr' ? 'शुभम अनिल खर्चे' : 'Shubham Anil Kharche'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'जन्मतारीख' : 'Date of Birth'}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 break-words">
                  {lang === 'mr' ? '२५ ऑगस्ट १९९६' : '25 August 1996'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'वय' : 'Age'}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 break-words">
                  {lang === 'mr' ? '३० वर्षे' : '30 Years'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'उंची' : 'Height'}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 break-words">
                  {lang === 'mr' ? '५ फूट ६ इंच' : '5 ft 6 in'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'शिक्षण' : 'Education'}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 break-words">B.E. Mechanical</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'व्यवसाय' : 'Occupation'}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 break-words">Senior QA Engineer</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'कंपनी' : 'Company'}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 break-words">Shaurya Technosoft Pvt. Ltd.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors bg-emerald-50/40">
                <td className="py-3.5 px-4 font-bold text-emerald-900 bg-emerald-50/70">
                  {lang === 'mr' ? 'वार्षिक उत्पन्न' : 'Annual Income'}
                </td>
                <td className="py-3.5 px-4 font-black text-emerald-950 break-words">
                  {lang === 'mr' ? '₹७.८ लाख' : '₹7.8 Lakh per annum'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'सध्याचे वास्तव्य' : 'Current Residence'}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 break-words">
                  {lang === 'mr' ? 'पुणे' : 'Pune'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-700 bg-slate-50/70">
                  {lang === 'mr' ? 'मूळ गाव' : 'Native Place'}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 break-words">
                  {lang === 'mr'
                    ? 'शेळगाव बाजार, ता. मोताळा, जि. बुलढाणा'
                    : 'Shelgaon Bazar, Tal. Motala, Dist. Buldhana'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ३. शैक्षणिक व व्यावसायिक माहिती */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '३. शैक्षणिक व व्यावसायिक माहिती' : '3. Educational & Professional Information'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3 font-normal">
            <p className="break-words">
              मी Mechanical Engineering मध्ये पदवी प्राप्त केली आहे. त्यानंतर IT क्षेत्रात करिअरची सुरुवात करून सध्या Software Testing आणि Quality Assurance क्षेत्रात कार्यरत आहे.
            </p>
            <p className="break-words">
              नवीन तंत्रज्ञान शिकणे, स्वतःच्या कौशल्यांमध्ये सुधारणा करणे आणि व्यावसायिक क्षेत्रात सातत्याने प्रगती करणे यामध्ये मला विशेष रस आहे.
            </p>
          </div>
        ) : (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3 font-normal">
            <p className="break-words">
              I completed my Bachelor's degree in Mechanical Engineering. Thereafter, I began my career in the IT industry and currently work in Software Testing and Quality Assurance.
            </p>
            <p className="break-words">
              I have a keen interest in learning new technologies, continuously upgrading my skills, and steadily advancing in my professional career.
            </p>
          </div>
        )}
      </section>

      {/* ४. कौटुंबिक पार्श्वभूमी */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '४. कौटुंबिक पार्श्वभूमी' : '4. Family Background'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3 font-normal">
            <p className="break-words">
              आमचे कुटुंब मूळचे शेळगाव बाजार, तालुका मोताळा, जिल्हा बुलढाणा येथील आहे. आमची कौटुंबिक पार्श्वभूमी शेतीशी संबंधित असून ग्रामीण संस्कार आणि कौटुंबिक मूल्यांना आमच्या कुटुंबात महत्त्व आहे.
            </p>
            <p className="break-words">
              कुटुंबातील नातेसंबंध, परस्पर आदर, विश्वास आणि एकमेकांना समजून घेणे या गोष्टींना मी महत्त्व देतो.
            </p>
          </div>
        ) : (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3 font-normal">
            <p className="break-words">
              Our family originally hails from Shelgaon Bazar, Taluka Motala, District Buldhana. Our family background is connected to agriculture, and we deeply value rural cultural traditions and strong family values.
            </p>
            <p className="break-words">
              I value family relationships, mutual respect, trust, and understanding one another.
            </p>
          </div>
        )}
      </section>

      {/* ५. स्वभाव व व्यक्तिमत्त्व */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '५. स्वभाव व व्यक्तिमत्त्व' : '5. Nature & Personality'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="space-y-2.5 text-base sm:text-lg text-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">साधा, शांत आणि समंजस स्वभाव.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">नवीन गोष्टी शिकण्याची आणि स्वतःमध्ये सुधारणा करण्याची आवड.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">कुटुंब आणि नातेसंबंधांना महत्त्व देणारा.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">जबाबदारीने वागण्यावर विश्वास.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">आधुनिक विचारसरणी आणि पारंपरिक मूल्यांचा समतोल राखण्याचा प्रयत्न.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-bold text-slate-900 break-words">निर्व्यसनी (धूम्रपान व मद्यपान करत नाही).</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-base sm:text-lg text-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Simple, calm, and understanding nature.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Passion for learning new things and continuous self-improvement.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Gives prime importance to family and relationships.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Believes in acting responsibly with integrity.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Strives to balance modern progressive outlook with traditional values.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-bold text-slate-900 break-words">Teetotaler (does not smoke or consume alcohol).</span>
            </div>
          </div>
        )}
      </section>

      {/* ६. आवडी-निवडी */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '६. आवडी-निवडी' : '6. Hobbies & Interests'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="space-y-2.5 text-base sm:text-lg text-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">नवीन तंत्रज्ञान आणि डिजिटल क्षेत्रातील गोष्टी जाणून घेणे.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">वाचन आणि नवीन विषयांचा अभ्यास करणे.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">पर्यटन आणि नवीन ठिकाणांना भेट देणे.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">वैयक्तिक विकास आणि नवीन कौशल्ये आत्मसात करणे.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-base sm:text-lg text-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Exploring emerging technologies and digital advancements.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Reading and studying diverse subjects.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Traveling and exploring new destinations.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
              <span className="font-medium break-words">Personal development and learning new life skills.</span>
            </div>
          </div>
        )}
      </section>

      {/* ७. भविष्यातील ध्येय व विचार */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '७. भविष्यातील ध्येय व विचार' : '7. Future Goals & Thoughts'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3.5 font-normal">
            <p className="break-words">
              करिअरमध्ये सातत्याने प्रगती करताना वैयक्तिक आयुष्यातही स्थैर्य आणि आनंद टिकवून ठेवण्याची इच्छा आहे.
            </p>
            <p className="bg-emerald-50/70 p-4 sm:p-5 rounded-xl border border-emerald-200 text-slate-900 font-medium leading-relaxed break-words">
              विवाहानंतर दोघांनी एकमेकांच्या स्वप्नांना, करिअरला आणि विचारांना पाठिंबा देत परस्पर सहकार्याने आयुष्याची वाटचाल करावी, असे मला वाटते.
            </p>
          </div>
        ) : (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3.5 font-normal">
            <p className="break-words">
              While steadily progressing in my professional career, I desire to maintain stability, harmony, and joy in personal life.
            </p>
            <p className="bg-emerald-50/70 p-4 sm:p-5 rounded-xl border border-emerald-200 text-slate-900 font-medium leading-relaxed break-words">
              After marriage, I believe both partners should support each other's dreams, careers, and viewpoints, progressing together in life with mutual respect and cooperation.
            </p>
          </div>
        )}
      </section>

      {/* ८. अपेक्षित जीवनसाथी */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '८. अपेक्षित जीवनसाथी' : '8. Partner Expectations'}
          </h2>
        </div>

        {lang === 'mr' ? (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3.5 font-normal">
            <p className="text-base sm:text-lg font-bold text-rose-900 break-words">
              जीवनसाथी ही केवळ आयुष्याची जोडीदार नसून एक चांगली मैत्रीण आणि सहप्रवासी असावी, अशी अपेक्षा आहे.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">समंजस, मनमोकळा आणि सकारात्मक दृष्टिकोन असलेली.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">कौटुंबिक नात्यांचा आदर करणारी.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">एकमेकांचे विचार आणि मतांचा आदर करणारी.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">आयुष्यातील चांगल्या-वाईट प्रसंगांत एकमेकांना साथ देणारी.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">स्वतःची स्वप्ने, आवडी आणि ध्येये जपणारी.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-3.5 font-normal">
            <p className="text-base sm:text-lg font-bold text-rose-900 break-words">
              Looking for a life partner who is not just a companion, but a good friend and fellow traveler in life's journey.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">Understanding, open-minded, and positive in outlook.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">Respectful of family relationships and cultural values.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">Respectful of each other's individual thoughts and opinions.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">Supportive of each other through both happy and challenging times.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-rose-600 font-bold text-lg select-none flex-shrink-0 mt-0.5">•</span>
                <span className="font-medium break-words">Committed to nurturing her own aspirations, interests, and dreams.</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ९. आमच्याशी संपर्क साधा - Clean Light Background as requested */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
            {lang === 'mr' ? '९. आमच्याशी संपर्क साधा' : '9. Contact Us'}
          </h2>
        </div>

        <p className="text-slate-800 text-base sm:text-lg font-normal leading-relaxed break-words">
          {lang === 'mr'
            ? 'आपणास वरील माहिती योग्य वाटल्यास आणि पुढील चर्चा करण्याची इच्छा असल्यास कृपया संपर्क साधावा.'
            : 'If you find the above information suitable and wish to discuss further, please feel free to contact us.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SHUBHAM_BIODATA.contacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-base sm:text-lg break-words">{contact.name}</h4>
                <p className="text-sm text-slate-600 mt-0.5 break-words">{contact.place}</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">{contact.phoneClean}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <a
                  href={`tel:${contact.phoneClean}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'mr' ? 'कॉल करा' : 'Call'}</span>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=91${contact.phoneClean}&text=${encodeURIComponent(
                    lang === 'mr'
                      ? 'नमस्कार, आम्ही चि. शुभम खर्चे यांच्या विवाहाच्या संदर्भाने संपर्क करत आहोत.'
                      : 'Hello, we are contacting you regarding the matrimonial profile of Shubham Kharche.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'mr' ? 'व्हॉट्सॲप' : 'WhatsApp'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer in Section 9 */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-base">
          <span className="font-bold text-slate-800">
            {lang === 'mr' ? 'धन्यवाद! 🙏' : 'Thank you! 🙏'}
          </span>
          <button
            type="button"
            onClick={onOpenGroomProfile}
            className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 transition-colors cursor-pointer text-sm sm:text-base"
          >
            <span>{lang === 'mr' ? '📄 मूळ विवाह पत्रिका पहा' : '📄 View Traditional Patrika'}</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>
      </section>

      {/* Bottom Switch Card (Standalone page only) */}
      {!isTabMode && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-base sm:text-lg break-words">
              {lang === 'mr' ? 'मूळ विवाह पत्रिका पाहायची आहे का?' : 'Want to view the traditional Patrika?'}
            </h4>
            <p className="text-sm text-slate-600 mt-0.5 break-words">
              {lang === 'mr'
                ? 'पारंपरिक नक्षीकाम व पत्रिकेसह डाऊनलोड पर्याय उपलब्ध आहे.'
                : 'Available with traditional borders and high-resolution download.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenGroomProfile}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>{lang === 'mr' ? '📄 विवाह पत्रिका पहा' : '📄 View Patrika'}</span>
          </button>
        </div>
      )}
    </div>
  );

  if (isTabMode) {
    return content;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm sm:text-base font-semibold flex items-center gap-2 border border-slate-700 pointer-events-none transition-opacity duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Action Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200 cursor-pointer flex-shrink-0"
            title="पुस्तिका पहा"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="hidden sm:inline">📖 पुस्तिका पहा</span>
            <span className="sm:hidden">पुस्तिका</span>
          </button>

          {/* Quick Actions & Language Toggle */}
          <div className="flex items-center gap-2">
            {/* Header Language Switcher */}
            <LanguageToggle />

            <button
              type="button"
              onClick={onOpenGroomProfile}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-800 hover:text-white bg-rose-50 hover:bg-rose-800 px-3 py-1.5 rounded-xl transition-colors border border-rose-200 cursor-pointer"
              title="मूळ विवाह पत्रिका पहा"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>📄 पत्रिका</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="व्हॉट्सॲपवर शेअर करा"
            >
              <Share2 className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">शेअर करा</span>
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="लिंक कॉपी करा"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0" />}
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
