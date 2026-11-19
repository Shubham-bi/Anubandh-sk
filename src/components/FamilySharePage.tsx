import React, { useState, useMemo, useEffect } from 'react';
import { Profile, ProfileInteraction } from '../types/profile';
import { BookletCandidate, parseCandidateContacts } from '../types/candidate';
import { buildCandidateProposalMessage, buildGenericShareMessage } from '../utils/messages';
import {
  ArrowLeft,
  Printer,
  Share2,
  Copy,
  Check,
  FileText,
  User,
  MapPin,
  Phone,
  GraduationCap,
  Calendar,
  Users,
  X
} from 'lucide-react';

interface UnifiedShareItem {
  id: string;
  srNo?: string;
  isBooklet: boolean;
  name: string;
  age: number;
  height: string;
  complexion?: string;
  blood?: string;
  gotra: string;
  mamkul: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  education: string;
  occupation: string;
  income: string;
  family: string;
  mulgaon: string;
  city: string;
  contacts: { name: string; address: string; phone: string }[];
  notes?: string;
  photoUrl?: string;
}

interface FamilySharePageProps {
  onBack: () => void;
  initialCandidate?: BookletCandidate | Profile | null;
  portalProfiles: Profile[];
  portalInteractions: Record<string, ProfileInteraction>;
  bookletCandidates: BookletCandidate[];
  bookletInteractions: Record<string, ProfileInteraction>;
  onShowToast: (msg: string) => void;
}

export const FamilySharePage: React.FC<FamilySharePageProps> = ({
  onBack,
  initialCandidate,
  portalProfiles,
  portalInteractions,
  bookletCandidates,
  bookletInteractions,
  onShowToast
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'whatsapp'>('preview');
  const [messageTemplate, setMessageTemplate] = useState<'proposal' | 'dossier' | 'generic'>('proposal');
  const [includeContacts, setIncludeContacts] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initialize selected ID
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (initialCandidate) {
      const id = 'nu_id' in initialCandidate ? initialCandidate.nu_id : initialCandidate.id;
      setSelectedIds([id]);
    } else {
      // Default to shortlisted candidates if no specific candidate provided
      const shortlistedIds: string[] = [];
      for (const [id, inter] of Object.entries(bookletInteractions)) {
        if (inter.status === 'shortlisted' || inter.stage === 'shortlisted') {
          shortlistedIds.push(id);
        }
      }
      for (const [id, inter] of Object.entries(portalInteractions)) {
        if (inter.status === 'shortlisted' || inter.stage === 'shortlisted') {
          shortlistedIds.push(id);
        }
      }
      if (shortlistedIds.length > 0) {
        setSelectedIds(shortlistedIds.slice(0, 5));
      } else if (bookletCandidates.length > 0) {
        setSelectedIds([bookletCandidates[0].id]);
      }
    }
  }, [initialCandidate, bookletInteractions, portalInteractions, bookletCandidates]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Convert all items to unified items
  const allUnifiedMap = useMemo(() => {
    const map = new Map<string, UnifiedShareItem>();

    // Portal profiles
    for (const p of portalProfiles) {
      const inter = portalInteractions[p.nu_id];
      const parsedContacts = [
        {
          name: p.fatherName || 'पालक',
          address: `${p.nativePlace || ''}, ता.${p.nativeTaluka || ''}, जि.${p.nativeDistrict || ''}`.replace(/^[\s,]+|[\s,]+$/g, ''),
          phone: p.mobile1 || p.fatherMobile || ''
        }
      ];

      map.set(p.nu_id, {
        id: p.nu_id,
        isBooklet: false,
        name: p.name,
        age: p.age,
        height: p.height,
        complexion: p.complexion,
        blood: p.bloodGroup,
        gotra: p.gotra,
        mamkul: p.mamkul || '',
        birthDate: p.birthdate,
        birthTime: p.birthtime,
        birthPlace: p.birthplace,
        education: p.education,
        occupation: p.occupation,
        income: p.income_label,
        family: `वडिलांचे नाव: ${p.fatherName || ''} (${p.fatherOccupation || ''})\nआई: ${p.motherName || ''} (${p.motherOccupation || ''})\nभाऊ: ${p.brothers || 'नाही'}, बहीण: ${p.sisters || 'नाही'}`,
        mulgaon: p.nativePlace || '',
        city: p.currentCity,
        contacts: parsedContacts,
        notes: inter?.notes,
        photoUrl: p.photos?.[0]
      });
    }

    // Booklet candidates
    for (const c of bookletCandidates) {
      const inter = bookletInteractions[c.id];
      const parsed = parseCandidateContacts(c.contact, c.phones);
      const unifiedContacts = parsed.map((item) => ({
        name: item.name || 'पालक / संपर्क',
        address: item.address || '',
        phone: item.phoneClean || ''
      }));

      map.set(c.id, {
        id: c.id,
        srNo: c.sr,
        isBooklet: true,
        name: c.name,
        age: c.age,
        height: c.height,
        complexion: c.complexion,
        blood: c.blood,
        gotra: c.gotra,
        mamkul: c.mamkul,
        birthDate: c.date,
        birthTime: c.time,
        education: c.edu,
        occupation: '',
        income: '',
        family: c.fam,
        mulgaon: c.mulgaon,
        city: '',
        contacts: unifiedContacts,
        notes: inter?.notes
      });
    }

    return map;
  }, [portalProfiles, portalInteractions, bookletCandidates, bookletInteractions]);

  // Selected items list
  const selectedItems = useMemo(() => {
    return selectedIds
      .map((id) => allUnifiedMap.get(id))
      .filter((item): item is UnifiedShareItem => Boolean(item));
  }, [selectedIds, allUnifiedMap]);

  // Generate WhatsApp message based on chosen template
  const generateWhatsAppMessage = (item: UnifiedShareItem): string => {
    if (messageTemplate === 'proposal') {
      return buildCandidateProposalMessage({
        candidateName: item.name,
        guardianName: item.contacts[0]?.name || 'पालक',
        listNumber: item.srNo
      });
    }

    if (messageTemplate === 'generic') {
      return buildGenericShareMessage();
    }

    // Full Detailed Dossier Template
    let msg = `*॥ लेवा शुभ मंगल - स्थळ परिचय ॥*\n\n`;
    msg += `*नाव:* ${item.name}\n`;
    msg += `*वय / उंची:* ${item.age} वर्षे, ${item.height}\n`;
    msg += `*गोत्र:* ${item.gotra} ${item.mamkul ? `(मामकूळ: ${item.mamkul})` : ''}\n`;
    msg += `*मुळगाव:* ${item.mulgaon || item.city}\n`;

    if (item.birthDate || item.birthTime) {
      msg += `*जन्म:* ${item.birthDate || ''} ${item.birthTime ? `वेळ: ${item.birthTime}` : ''}\n`;
    }

    msg += `*शिक्षण व नोकरी:* ${item.education}\n`;
    if (item.occupation) {
      msg += `*व्यवसाय / पद:* ${item.occupation} ${item.income ? `(${item.income})` : ''}\n`;
    }

    if (item.family) {
      msg += `\n*कौटुंबिक माहिती:*\n${item.family}\n`;
    }

    if (includeContacts && item.contacts.length > 0) {
      msg += `\n*संपर्क:*\n`;
      for (const [idx, c] of item.contacts.entries()) {
        msg += `${idx + 1}) ${c.name} ${c.address ? `- ${c.address}` : ''} ${c.phone ? `(📞 ${c.phone})` : ''}\n`;
      }
    }

    if (includeNotes && item.notes) {
      msg += `\n*टीप:* ${item.notes}\n`;
    }

    msg += `\n_लेवा शुभ मंगल डिजिटल मॅचमेकिंग पोर्टल_`;
    return msg;
  };

  // Copy WhatsApp message to clipboard
  const handleCopyWhatsApp = (item: UnifiedShareItem, index: number) => {
    const text = generateWhatsAppMessage(item);
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onShowToast(`${item.name} ची माहिती क्लिपबोर्डवर कॉपी झाली!`);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  // Direct WhatsApp Share
  const handleShareWhatsAppDirect = (item: UnifiedShareItem) => {
    const text = generateWhatsAppMessage(item);
    const encoded = encodeURIComponent(text);
    const targetPhone = item.contacts[0]?.phone?.replace(/\D/g, '') || '';
    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=91${targetPhone.slice(-10)}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Print Dossier handler
  const handlePrintDossier = () => {
    window.print();
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-200">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>मागे (Back)</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm hidden sm:flex">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  कौटुंबिक चर्चा पत्रिका व PDF
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  WhatsApp किंवा A4 छापील PDF द्वारे स्थळ माहिती शेअर करा
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintDossier}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs"
              title="A4 कागदावर प्रिंट करा किंवा PDF म्हणून सेव्ह करा"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 PDF / प्रिंट</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Format Selector and Checkboxes */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 PDF पूर्वावलोकन (Preview)</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp मेसेज स्वरूप</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeContacts}
                onChange={(e) => setIncludeContacts(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
              />
              <span>फोन नंबर दाखवा</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
              />
              <span>वैयक्तिक टीपा</span>
            </label>
          </div>
        </div>

        {/* Selected Candidates Pill Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex items-center gap-2 overflow-x-auto thin-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex-shrink-0">
            निवडलेली स्थळे ({selectedItems.length}):
          </span>
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold whitespace-nowrap flex-shrink-0"
            >
              <span>{item.name}</span>
              <button
                onClick={() => toggleSelectCandidate(item.id)}
                className="hover:text-rose-950 p-0.5 rounded-full hover:bg-rose-200/50"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedItems.length === 0 && (
            <span className="text-xs text-rose-600 font-semibold">
              कृपया किमान एक उमेदवार निवडा.
            </span>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'preview' ? (
          /* A4 Styled Printable Dossier Sheets */
          <div className="space-y-6 max-w-3xl mx-auto">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm print-page-break space-y-5 relative"
              >
                {/* Traditional Auspicious Header */}
                <div className="text-center pb-3 border-b-2 border-rose-600/30">
                  <p className="text-xs font-serif font-black text-rose-800 tracking-wider">
                    ॥ श्री गणेशाय नमः ॥
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
                    लेवा शुभ मंगल - कौटुंबिक चर्चा पत्रिका
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.isBooklet ? 'मेळावा नोंदणी पुस्तिका' : 'ऑनलाइन पोर्टल नोंदणी'}
                    {item.srNo ? ` • अनु. क्र. ${item.srNo}` : ''}
                  </p>
                </div>

                {/* Candidate Highlight Hero Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50/40 to-rose-50 border border-rose-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-rose-600 shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0">
                        {item.name.replace(/कु\.?\s*/, '').trim()?.[0] || 'ल'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-rose-800 font-bold mt-0.5">
                        वय: {item.age} वर्षे • उंची: {item.height} {item.blood ? `• रक्तगट: ${item.blood}` : ''}
                      </p>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        गोत्र: <span className="text-rose-700 font-bold">{item.gotra}</span>
                        {item.mamkul ? ` • मामकूळ: ${item.mamkul}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 bg-white/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-rose-100 sm:border-0 w-full sm:w-auto">
                    <span className="text-[11px] font-bold text-slate-400 block">मुळगाव / शहर</span>
                    <span className="text-sm font-black text-slate-800 flex items-center gap-1 sm:justify-end">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      {item.mulgaon || item.city}
                    </span>
                  </div>
                </div>

                {/* Key Details 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Education & Occupation */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                      शिक्षण व व्यवसाय
                    </span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm whitespace-pre-line leading-snug">
                      {item.education}
                    </p>
                    {item.occupation && (
                      <p className="text-slate-600 font-medium pt-1 border-t border-slate-200">
                        {item.occupation} {item.income ? `• ${item.income}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Birth Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-rose-600" />
                      जन्म तपशील
                    </span>
                    <div className="space-y-0.5 text-slate-800">
                      <p className="font-semibold">तारीख: {item.birthDate || 'माहिती उपलब्ध नाही'}</p>
                      <p className="font-semibold">वेळ: {item.birthTime || 'माहिती उपलब्ध नाही'}</p>
                      {item.birthPlace && <p className="text-slate-600">ठिकाण: {item.birthPlace}</p>}
                    </div>
                  </div>
                </div>

                {/* Family Details */}
                {item.family && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-rose-600" />
                      कौटुंबिक माहिती
                    </span>
                    <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                      {item.family}
                    </p>
                  </div>
                )}

                {/* Contact Information (if enabled) */}
                {includeContacts && item.contacts.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2 text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-amber-700" />
                      पालक व संपर्क पत्ते
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.contacts.map((c, cIdx) => (
                        <div key={cIdx} className="p-2.5 rounded-xl bg-white border border-amber-200/80 space-y-1">
                          <p className="font-bold text-slate-900">{c.name}</p>
                          {c.address && <p className="text-slate-600 text-[11px]">{c.address}</p>}
                          {c.phone && (
                            <p className="text-rose-700 font-mono font-bold text-xs flex items-center gap-1">
                              📞 {c.phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Private Notes */}
                {includeNotes && item.notes && (
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-1">
                    <span className="font-bold text-purple-900 block">वैयक्तिक टीप:</span>
                    <p className="text-slate-700 font-medium">{item.notes}</p>
                  </div>
                )}

                {/* A4 Sheet Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>लेवा शुभ मंगल • दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध</span>
                  <span>तारीख: {new Date().toLocaleDateString('mr-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* WhatsApp Message Generation Tab */
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Template Selector */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 mr-1">मेसेज प्रकार निवडा:</span>
              <button
                onClick={() => setMessageTemplate('proposal')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  messageTemplate === 'proposal'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                💌 स्थळ प्रस्ताव (पालकांशी चर्चा)
              </button>
              <button
                onClick={() => setMessageTemplate('dossier')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  messageTemplate === 'dossier'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📋 सविस्तर माहिती पत्रिका
              </button>
              <button
                onClick={() => setMessageTemplate('generic')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  messageTemplate === 'generic'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🌐 नातेवाईकांसाठी शोध मेसेज
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <Share2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                खालील मजकूर WhatsApp वर पाठवण्यासाठी अगदी तयार आहे. <strong>'WhatsApp वर पाठवा'</strong> वर क्लिक करा किंवा कॉपी करून पाठवा.
              </span>
            </div>

            {selectedItems.map((item, idx) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-600" />
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyWhatsApp(item, idx)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? 'कॉपी झाले!' : 'कॉपी करा'}</span>
                    </button>

                    <button
                      onClick={() => handleShareWhatsAppDirect(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp वर पाठवा</span>
                    </button>
                  </div>
                </div>

                {/* Formatted Text Box */}
                <pre className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                  {generateWhatsAppMessage(item)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Print Container specifically targeted by @media print */}
      <div className="family-dossier-print-container hidden">
        {selectedItems.map((item, idx) => (
          <div key={item.id} className="p-8 print-page-break space-y-4">
            <div className="text-center pb-2 border-b-2 border-slate-900">
              <p className="text-sm font-serif font-black">॥ श्री गणेशाय नमः ॥</p>
              <h1 className="text-2xl font-black text-slate-900 mt-1">लेवा शुभ मंगल - कौटुंबिक चर्चा पत्रिका</h1>
              <p className="text-xs text-slate-600">स्थळ क्र. {idx + 1} • {item.name}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-300 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{item.name}</h2>
                <p className="text-sm text-slate-700 font-semibold mt-1">
                  वय: {item.age} वर्षे • उंची: {item.height} {item.blood ? `• रक्तगट: ${item.blood}` : ''}
                </p>
                <p className="text-sm text-slate-800 font-bold mt-0.5">
                  गोत्र: {item.gotra} {item.mamkul ? `• मामकूळ: ${item.mamkul}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">मुळगाव</span>
                <span className="text-base font-black text-slate-800">{item.mulgaon || item.city}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-1">शिक्षण व नोकरी / व्यवसाय</h3>
                <p className="font-semibold text-slate-800 whitespace-pre-line">{item.education}</p>
                {item.occupation && <p className="text-slate-700 mt-1">{item.occupation} {item.income ? `• ${item.income}` : ''}</p>}
              </div>

              <div className="p-3 rounded-lg border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-1">जन्म तपशील</h3>
                <p>तारीख: {item.birthDate || 'N/A'}</p>
                <p>वेळ: {item.birthTime || 'N/A'}</p>
                {item.birthPlace && <p>ठिकाण: {item.birthPlace}</p>}
              </div>
            </div>

            {item.family && (
              <div className="p-3 rounded-lg border border-slate-300 text-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-1">कौटुंबिक पार्श्वभूमी</h3>
                <p className="whitespace-pre-line text-slate-700">{item.family}</p>
              </div>
            )}

            {includeContacts && item.contacts.length > 0 && (
              <div className="p-3 rounded-lg border border-slate-300 text-xs space-y-2">
                <h3 className="font-bold text-sm text-slate-900">संपर्क तपशील</h3>
                <div className="grid grid-cols-2 gap-2">
                  {item.contacts.map((c, cIdx) => (
                    <div key={cIdx} className="p-2 border border-slate-200 rounded">
                      <p className="font-bold text-slate-900">{cIdx + 1}) {c.name}</p>
                      {c.address && <p className="text-slate-600">{c.address}</p>}
                      {c.phone && <p className="font-mono font-bold text-slate-800">मोबाईल: {c.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300 flex justify-between text-xs text-slate-500">
              <span>LSM Matrimony - लेवा शुभ मंगल</span>
              <span>तारीख: {new Date().toLocaleDateString('mr-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
