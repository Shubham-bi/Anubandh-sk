import React, { useState, useMemo, useEffect } from 'react';
import { Profile, ProfileInteraction } from '../types/profile';
import { BookletCandidate, parseCandidateContacts } from '../types/candidate';
import {
  X,
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
  Users
} from 'lucide-react';

interface UnifiedShareItem {
  id: string;
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

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCandidate?: BookletCandidate | Profile | null;
  portalProfiles: Profile[];
  portalInteractions: Record<string, ProfileInteraction>;
  bookletCandidates: BookletCandidate[];
  bookletInteractions: Record<string, ProfileInteraction>;
  onShowToast: (msg: string) => void;
}

export const FamilyShareModal: React.FC<FamilyShareModalProps> = ({
  isOpen,
  onClose,
  initialCandidate,
  portalProfiles,
  portalInteractions,
  bookletCandidates,
  bookletInteractions,
  onShowToast
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'whatsapp'>('preview');
  const [includeContacts, setIncludeContacts] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initialize selected ID
  useEffect(() => {
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
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      if (p.mobile2 && p.mobile2 !== p.mobile1) {
        parsedContacts.push({
          name: 'इतर संपर्क',
          address: p.currentCity || '',
          phone: p.mobile2
        });
      }

      map.set(p.nu_id, {
        id: p.nu_id,
        isBooklet: false,
        name: p.name,
        age: p.age || 25,
        height: p.height || "५'४''",
        complexion: p.complexion || 'गोरा',
        blood: p.bloodGroup || '',
        gotra: p.gotra || 'अज्ञात',
        mamkul: p.mamkul || '',
        birthDate: p.birthdate || '',
        birthTime: p.birthtime || '',
        birthPlace: p.birthplace || '',
        education: p.education || '',
        occupation: p.occupation ? `${p.occupation} (${p.currentCity})` : '',
        income: p.income_label || '',
        family: `वडील: ${p.fatherName || 'माहिती उपलब्ध नाही'} (${p.fatherOccupation || ''})\nभाऊ: ${p.brothers || 'नाही'}, बहिण: ${p.sisters || 'नाही'}\nमामा: ${p.uncleName || 'उपलब्ध नाही'} ${p.unclePlace ? `(${p.unclePlace})` : ''}`,
        mulgaon: p.nativePlace || p.nativeDistrict || '',
        city: p.currentCity || '',
        contacts: parsedContacts.filter((c) => c.phone || c.name),
        notes: inter?.notes || '',
        photoUrl: p.photos?.[0]
      });
    }

    // Booklet candidates
    for (const b of bookletCandidates) {
      const inter = bookletInteractions[b.id];
      const parsed = parseCandidateContacts(b.contact, b.phones);
      map.set(b.id, {
        id: b.id,
        isBooklet: true,
        name: b.name,
        age: b.age || 25,
        height: b.height || "५'४''",
        complexion: b.complexion || 'गोरा',
        blood: b.blood || '',
        gotra: b.gotra || 'अज्ञात',
        mamkul: b.mamkul || '',
        birthDate: b.date || '',
        birthTime: b.time || '',
        education: b.edu || '',
        occupation: '',
        income: '',
        family: b.fam || '',
        mulgaon: b.mulgaon || '',
        city: b.mulgaon || '',
        contacts: parsed.map((p) => ({
          name: p.name,
          address: p.address,
          phone: p.phoneClean || p.phoneRaw
        })),
        notes: inter?.notes || ''
      });
    }

    return map;
  }, [portalProfiles, portalInteractions, bookletCandidates, bookletInteractions]);

  // Selected candidates array
  const selectedItems = useMemo(() => {
    return selectedIds
      .map((id) => allUnifiedMap.get(id))
      .filter((item): item is UnifiedShareItem => Boolean(item));
  }, [selectedIds, allUnifiedMap]);

  // Format WhatsApp Message for a candidate
  const generateWhatsAppMessage = (item: UnifiedShareItem): string => {
    const lines: string[] = [];
    lines.push('*॥ श्री गणेशाय नमः ॥*');
    lines.push('*लेवा शुभ मंगल - स्थळ माहिती (Family Dossier)*');
    lines.push('--------------------------------');
    lines.push(`👤 *नाव:* ${item.name}`);
    lines.push(`🎂 *वय:* ${item.age} वर्षे | *उंची:* ${item.height}`);
    if (item.complexion || item.blood) {
      lines.push(`✨ *वर्ण / रक्तगट:* ${item.complexion || ''} ${item.blood ? `(${item.blood})` : ''}`);
    }
    lines.push(`🌾 *गोत्र:* ${item.gotra} | *मामकूळ:* ${item.mamkul || 'N/A'}`);
    if (item.birthDate || item.birthTime) {
      lines.push(`📅 *जन्म:* ${item.birthDate || ''} ${item.birthTime ? `(${item.birthTime})` : ''}`);
    }
    lines.push(`🎓 *शिक्षण:* ${item.education}`);
    if (item.occupation || item.income) {
      lines.push(`💼 *नोकरी / व्यवसाय:* ${item.occupation || 'माहिती उपलब्ध'} ${item.income ? `(वार्षिक ${item.income})` : ''}`);
    }
    lines.push(`🏡 *मुळगाव:* ${item.mulgaon} ${item.city && item.city !== item.mulgaon ? `(सध्या: ${item.city})` : ''}`);
    if (item.family) {
      lines.push(`👨‍👩‍👧 *कौटुंबिक माहिती:* ${item.family.replace(/\n/g, ' • ')}`);
    }

    if (includeContacts && item.contacts.length > 0) {
      lines.push('--------------------------------');
      lines.push('📞 *संपर्क तपशील:*');
      item.contacts.forEach((c, idx) => {
        lines.push(`${idx + 1}) *${c.name}* ${c.address ? `(${c.address})` : ''}`);
        if (c.phone) lines.push(`   फोन: ${c.phone}`);
      });
    }

    if (includeNotes && item.notes) {
      lines.push(`📝 *टीप:* ${item.notes}`);
    }

    lines.push('--------------------------------');
    lines.push('_LSM Matrimony - लेवा शुभ मंगल_');
    return lines.join('\n');
  };

  const handleCopyWhatsApp = (item: UnifiedShareItem, index: number) => {
    const text = generateWhatsAppMessage(item);
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onShowToast('मजकूर क्लिपबोर्डवर कॉपी झाला!');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleShareWhatsAppDirect = (item: UnifiedShareItem) => {
    const text = generateWhatsAppMessage(item);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>कौटुंबिक चर्चा पत्रिका व PDF</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Family Share
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                पालक व नातेवाईकांशी WhatsApp किंवा A4 छापील PDF द्वारे स्थळ माहिती शेअर करा.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Candidate Selector Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 PDF पूर्वावलोकन (Preview)</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp मेसेज स्वरूप</span>
            </button>
          </div>

          {/* Settings checkboxes & Print Trigger */}
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

            <button
              onClick={handlePrintDossier}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition-all shadow-sm"
              title="A4 कागदावर प्रिंट करा किंवा PDF म्हणून सेव्ह करा"
            >
              <Printer className="w-4 h-4" />
              <span>A4 PDF सेव्ह / प्रिंट</span>
            </button>
          </div>
        </div>

        {/* Selected Candidates Pill Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">निवडलेली स्थळे ({selectedItems.length}):</span>
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold whitespace-nowrap"
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
              कृपया खालील यादीतून किमान एक उमेदवार निवडा.
            </span>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-100/70 space-y-6">
          {activeTab === 'preview' ? (
            /* A4 Styled Printable Dossier Sheets */
            <div className="space-y-6 max-w-3xl mx-auto">
              {selectedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm print-page-break space-y-5 relative"
                >
                  {/* Traditional Auspicious Header */}
                  <div className="text-center pb-3 border-b-2 border-rose-600/30">
                    <p className="text-xs font-serif font-black text-rose-800 tracking-wider">
                      ॥ श्री गणेशाय नमः ॥
                    </p>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                      लेवा शुभ मंगल - कौटुंबिक चर्चा पत्रिका
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      स्थळ क्र. {idx + 1} • {item.isBooklet ? 'मेळावा पुस्तिका नोंदणी' : 'ऑनलाइन पोर्टल नोंदणी'}
                    </p>
                  </div>

                  {/* Main Profile Info Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                    <div className="flex items-center gap-4">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                          {item.name.replace(/कु\.?\s*/, '').trim()?.[0] || 'ल'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-black text-slate-900">{item.name}</h4>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {item.age} वर्षे • उंची: {item.height} {item.blood ? `• रक्तगट: ${item.blood}` : ''}
                        </p>
                        <p className="text-xs text-rose-800 font-bold mt-0.5">
                          गोत्र: {item.gotra} {item.mamkul ? `• मामकूळ: ${item.mamkul}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <span className="text-[11px] font-bold text-slate-500 block">मुळगाव / शहर</span>
                      <span className="text-sm font-extrabold text-slate-800">{item.mulgaon || item.city}</span>
                    </div>
                  </div>

                  {/* Two Column Grid for Key Biodata Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Education & Career */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>शिक्षण व नोकरी / व्यवसाय</span>
                      </div>
                      <p className="font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                        {item.education}
                      </p>
                      {item.occupation && (
                        <p className="text-slate-600 font-medium pt-1 border-t border-slate-200">
                          {item.occupation} {item.income ? `• ${item.income}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Birth & Kundali Details */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span>जन्म तपशील व पत्रिका</span>
                      </div>
                      <div className="space-y-1 text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-500">जन्म दिनांक:</span> {item.birthDate || 'N/A'}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">जन्म वेळ:</span> {item.birthTime || 'N/A'}
                        </p>
                        {item.birthPlace && (
                          <p>
                            <span className="font-semibold text-slate-500">जन्म ठिकाण:</span> {item.birthPlace}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Family Background */}
                  {item.family && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>कौटुंबिक माहिती (आई, वडील, भाऊ, बहीण, मामा)</span>
                      </div>
                      <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                        {item.family}
                      </p>
                    </div>
                  )}

                  {/* Contact Persons Box */}
                  {includeContacts && item.contacts.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2.5 text-xs">
                      <div className="font-bold text-amber-950 flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-700" />
                          <span>संपर्क व्यक्ती व पत्ते ({item.contacts.length})</span>
                        </span>
                        <span className="text-[10px] text-amber-800">कौटुंबिक चर्चा व चौकशीसाठी</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.contacts.map((c, cIdx) => (
                          <div key={cIdx} className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 text-[10px] flex items-center justify-center font-bold">
                                {cIdx + 1}
                              </span>
                              <span>{c.name}</span>
                            </div>
                            {c.address && (
                              <div className="text-[11px] text-slate-500 flex items-start gap-1 ml-5">
                                <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                                <span>{c.address}</span>
                              </div>
                            )}
                            {c.phone && (
                              <div className="font-mono font-bold text-slate-800 ml-5 text-[11px]">
                                📞 {c.phone}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optional Notes */}
                  {includeNotes && item.notes && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold block mb-0.5">📝 वैयक्तिक टीप:</span>
                      <p>{item.notes}</p>
                    </div>
                  )}

                  {/* Footer note */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>LSM Matrimony PWA • लेवा शुभ मंगल</span>
                    <span>तारीख: {new Date().toLocaleDateString('mr-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* WhatsApp Formatted Text Preview & 1-Click Share */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <Share2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  खालील मजकूर WhatsApp वर पाठवण्यासाठी अगदी तयार आहे. <strong>'WhatsApp वर पाठवा'</strong> वर क्लिक करा किंवा कॉपी करून फॅमिली ग्रुपवर टाका.
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
    </div>
  );
};