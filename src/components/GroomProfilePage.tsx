import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Printer,
  Share2,
  Copy,
  Check,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  Heart,
  ArrowLeft,
  Building
} from 'lucide-react';
import { BIODATA_URL } from '../utils/messages';

interface GroomProfilePageProps {
  onBackToPortal?: () => void;
}

export const GroomProfilePage: React.FC<GroomProfilePageProps> = ({ onBackToPortal }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(BIODATA_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `नमस्कार! चि. शुभम अनिल खर्चे (B.E. Mech, Sr. QA Engineer, Pune) यांचा विवाह बायोडाटा पाहण्यासाठी खालील लिंक उघडा:\n${BIODATA_URL}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-slate-50 to-amber-50/50 py-6 sm:py-10 px-3 sm:px-6 selection:bg-rose-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar / Top Action Controls */}
        <div className="no-print flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          {onBackToPortal ? (
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-rose-600" />
              <span>वधू स्थळे पहा (Matrimony Portal)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="Anubandh" className="w-6 h-6 rounded-lg object-contain" />
              <span className="font-extrabold text-sm text-slate-800">Anubandh अनुबंध</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs"
              title="बायोडाटा लिंक कॉपी करा"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'कॉपी झाले!' : 'लिंक कॉपी'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              title="बायोडाटा A4 कागदावर प्रिंट करा किंवा PDF म्हणून सेव्ह करा"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/30"
              title="WhatsApp वर शेअर करा"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">शेअर करा</span>
            </button>
          </div>
        </div>

        {/* Main Biodata Sheet Card */}
        <article className="bg-white rounded-3xl shadow-xl shadow-rose-950/5 border border-slate-200/90 overflow-hidden relative print:shadow-none print:border-none print:rounded-none">
          {/* Traditional Auspicious Header Banner */}
          <header className="relative bg-gradient-to-r from-rose-800 via-rose-700 to-amber-700 text-white px-6 py-8 sm:py-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/20 pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <p className="font-serif font-black text-amber-200 tracking-widest text-xs sm:text-sm">
                ॥ श्री गणेशाय नमः ॥ • ॥ कुलदेवता प्रसन्न ॥
              </p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                चि. शुभम अनिल खर्चे
              </h1>
              <p className="text-xs sm:text-base text-rose-100 font-semibold tracking-wide">
                अनुबंध • वर परिचय (Groom Matrimonial Biodata)
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide backdrop-blur-xs">
                  लेवा पाटीदार (Leva Patidar)
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black tracking-wide shadow-xs">
                  Sr. QA Engineer (IT)
                </span>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Quick Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-rose-50/60 p-4 sm:p-5 rounded-2xl border border-rose-200/80 text-center">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">वय व जन्मतारीख</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 block">२८ वर्षे • 25/08/1996</span>
              </div>
              <div className="space-y-1 border-l border-rose-200/80">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">उंची व रक्तगट</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 block">५' ९'' • B+</span>
              </div>
              <div className="space-y-1 sm:border-l border-rose-200/80">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">शिक्षण</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 block">B.E. Mechanical</span>
              </div>
              <div className="space-y-1 border-l border-rose-200/80">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">वार्षिक पॅकेज</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-700 block">₹ ७.८ लाख (LPA)</span>
              </div>
            </div>

            {/* Section 1: वैयक्तिक व जन्मपत्रिका माहिती */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-600/30">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  १. वैयक्तिक व जन्मपत्रिका माहिती (Personal & Horoscope)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">पूर्ण नाव:</span>
                  <span className="font-bold text-slate-900 text-right">शुभम अनिल खर्चे (Shubham Kharche)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">जन्मतारीख:</span>
                  <span className="font-bold text-slate-900 text-right">२५ ऑगस्ट १९९६ (25/08/1996)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">वय:</span>
                  <span className="font-bold text-slate-900 text-right">२८ वर्षे</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">उंची / वर्ण:</span>
                  <span className="font-bold text-slate-900 text-right">५ फूट ९ इंच (5'9'') • गोरा</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">रक्तगट:</span>
                  <span className="font-bold text-slate-900 text-right">B+ (पॉझिटिव्ह)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">धर्म व जात:</span>
                  <span className="font-bold text-slate-900 text-right">हिंदू - लेवा पाटीदार / लेवा गुजर</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">गोत्र:</span>
                  <span className="font-bold text-rose-700 text-right">वशिष्ठ (Vashishtha)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">मामकूळ:</span>
                  <span className="font-bold text-slate-900 text-right">नाफडे (Nafade - नांदुरा)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">वैवाहिक स्थिती:</span>
                  <span className="font-bold text-slate-900 text-right">अविवाहित (Never Married)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between">
                  <span className="text-slate-500 font-medium">मूळगाव:</span>
                  <span className="font-bold text-slate-900 text-right">मलकापूर, जि. बुलढाणा</span>
                </div>
              </div>
            </section>

            {/* Section 2: शिक्षण व नोकरी / करिअर */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-600/30">
                <Briefcase className="w-5 h-5 text-rose-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  २. शिक्षण व व्यावसायिक माहिती (Education & Career)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                  <div className="flex items-center gap-2 text-amber-950 font-bold">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <span>उच्च शिक्षण (Education)</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">
                    B.E. Mechanical Engineering
                  </p>
                  <p className="text-slate-600 text-xs">
                    मान्यताप्राप्त विद्यापीठातून बॅचलर ऑफ इंजिनिअरिंग पदवी पूर्ण.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span>सध्याची नोकरी (Current Occupation)</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">
                    Senior QA Engineer
                  </p>
                  <p className="text-slate-700 font-semibold text-xs">
                    Shaurya Technosoft Pvt. Ltd., Pune
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-emerald-200">
                    <span className="text-slate-500 font-medium">वार्षिक पॅकेज (CTC):</span>
                    <span className="font-black text-emerald-800">₹ ७.८ लाख प्रति वर्ष (7.8 LPA)</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>सध्याचे कामाचे ठिकाण व वास्तव्य:</span>
                </span>
                <span className="font-bold text-slate-900">पुणे, महाराष्ट्र (Pune, Maharashtra)</span>
              </div>
            </section>

            {/* Section 3: कौटुंबिक माहिती */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-600/30">
                <Users className="w-5 h-5 text-rose-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ३. कौटुंबिक पार्श्वभूमी (Family Background)
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">वडिलांचे नाव व व्यवसाय:</span>
                  <span className="font-bold text-slate-900 text-left sm:text-right">
                    श्री. डॉ. अनिल वसंत खर्चे (प्राचार्य / प्रोफेसर, कॉलेज ऑफ इंजिनिअरिंग, मलकापूर)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">आईचे नाव व व्यवसाय:</span>
                  <span className="font-bold text-slate-900 text-left sm:text-right">
                    सौ. संगीता अनिल खर्चे (ग्रंथपाल / अभियंता, मलकापूर)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">बहीण:</span>
                  <span className="font-bold text-slate-900 text-left sm:text-right">
                    डॉ. कल्याणी अनिल खर्चे (MBBS, Cooper Hospital, Juhu, Mumbai)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">स्थिर व मूळ पत्ता:</span>
                  <span className="font-bold text-slate-900 text-left sm:text-right">
                    डॉ. जयश्री खर्चे पॅथ लॅब, बीजीटीआय रोड, मलकापूर, जि. बुलढाणा - ४४३१०१
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4: अपेक्षा (Partner Expectations) */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-600/30">
                <Heart className="w-5 h-5 text-rose-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ४. अनुरूप वधू अपेक्षा (Expectations)
                </h2>
              </div>

              <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200/80 text-xs sm:text-sm leading-relaxed text-slate-800">
                <p className="font-medium">
                  • सुविद्य, सुसंस्कृत आणि कौटुंबिक मूल्यांचा आदर करणारी अनुरूप वधू.
                </p>
                <p className="font-medium mt-1">
                  • शिक्षण: पदवीधर / इंजिनिअर (B.E. / B.Tech / M.E.) / आयटी व्यावसायिक (IT / Software) / वैद्यकीय (Doctor / Health Sciences) किंवा समकक्ष.
                </p>
                <p className="font-medium mt-1">
                  • जात: लेवा पाटीदार / लेवा गुजर (जातीचे बंधन शिथिल - सुयोग्य अनुरूप स्थळ असल्यास).
                </p>
              </div>
            </section>

            {/* Section 5: संपर्क माहिती व थेट कॉल/मेसेज */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-600/30">
                <Phone className="w-5 h-5 text-rose-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ५. संपर्क व पुढील चर्चा (Contact Details)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Card 1 */}
                <div className="p-4 bg-white rounded-2xl border-2 border-rose-200 shadow-sm space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">प्राथमिक संपर्क</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">खर्चे परिवार (मलकापूर / पुणे)</h3>
                    <p className="text-xs text-slate-500 font-mono font-bold mt-1">
                      📱 9420539396 / 9422152231
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="tel:9420539396"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>कॉल करा</span>
                    </a>
                    <a
                      href="https://wa.me/919420539396?text=नमस्ते,%20चि.%20शुभम%20खर्चे%20यांच्या%20स्थळाबाबत%20संपर्क%20साधत%20आहोत."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shadow-emerald-600/30"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Contact Card 2 */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">पालक संपर्क</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">डॉ. अनिल वसंत खर्चे</h3>
                    <p className="text-xs text-slate-500 font-mono font-bold mt-1">
                      📱 8149590484 / 9284504405
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="tel:8149590484"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>कॉल करा</span>
                    </a>
                    <a
                      href="https://wa.me/918149590484?text=नमस्ते,%20चि.%20शुभम%20खर्चे%20यांच्या%20स्थळाबाबत%20संपर्क%20साधत%20आहोत."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <footer className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Anubandh अनुबंध • दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध</span>
            <span className="font-semibold text-slate-600">तारीख: {new Date().toLocaleDateString('mr-IN')}</span>
          </footer>
        </article>
      </div>
    </div>
  );
};
