import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Tag,
  Plus,
  GraduationCap,
  Users,
  MapPin,
  Heart,
  User,
  FileText,
  Edit,
  Copy,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookletCandidate, parseCandidateContacts } from '../types/candidate';
import { ProfileInteraction, TriageStatus } from '../types/profile';
import { getProposalWhatsAppUrl, buildCandidateProposalMessage } from '../utils/messages';

interface BookletDetailPageProps {
  candidate: BookletCandidate;
  interaction?: ProfileInteraction;
  onBack: () => void;
  onStatusChange: (id: string, status: TriageStatus) => void;
  onRatingChange: (id: string, rating: number) => void;
  onNotesChange: (id: string, notes: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onEdit?: (candidate: BookletCandidate) => void;
  onShareFamily?: (candidate: BookletCandidate) => void;
}

export const BookletDetailPage: React.FC<BookletDetailPageProps> = ({
  candidate,
  interaction,
  onBack,
  onStatusChange,
  onRatingChange,
  onNotesChange,
  onAddTag,
  onRemoveTag,
  onEdit
}) => {
  const [localNotes, setLocalNotes] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [copiedContactIdx, setCopiedContactIdx] = useState<number | null>(null);

  useEffect(() => {
    if (interaction?.notes) {
      setLocalNotes(interaction.notes);
    } else {
      setLocalNotes('');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [candidate?.id, interaction?.notes]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const status = interaction?.status || 'default';
  const rating = interaction?.rating || 0;
  const tags = interaction?.tags || [];

  const handleNotesBlur = () => {
    if (localNotes !== interaction?.notes) {
      onNotesChange(candidate.id, localNotes);
    }
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      onAddTag(candidate.id, newTagInput.trim());
      setNewTagInput('');
    }
  };

  const handleShortlist = () => {
    const next = status === 'shortlisted' ? 'default' : 'shortlisted';
    onStatusChange(candidate.id, next);
    if (next === 'shortlisted') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    }
  };

  // Structured contact persons
  const contacts = parseCandidateContacts(candidate.contact, candidate.phones);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-200">
      {/* Sticky Top Navigation & Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>मागे (Back)</span>
          </button>

          {/* Candidate Name & Summary */}
          <div className="min-w-0 text-center flex-1 px-2">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 truncate">
              {candidate.name}
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold truncate hidden sm:block">
              अनु. क्र. {candidate.sr || candidate.id} • {candidate.age} वर्षे • गोत्र: {candidate.gotra} • {candidate.mulgaon}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(candidate)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="माहिती संपादित करा (Edit Candidate)"
              >
                <Edit className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">संपादित करा</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
          {/* Hero Banner */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-rose-50 via-pink-50/50 to-amber-50 border-b border-rose-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-rose-600/20 flex-shrink-0">
                  {candidate.name.replace(/कु\.?\s*/, '').trim()?.[0] || 'ल'}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {candidate.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                      गोत्र: {candidate.gotra}
                    </span>
                    {candidate.mamkul && (
                      <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        मामकूळ: {candidate.mamkul}
                      </span>
                    )}
                    <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {candidate.mulgaon}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex-shrink-0 self-end sm:self-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRatingChange(candidate.id, rating === star ? 0 : star)}
                    className="text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${rating >= star ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Key Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">वय व उंची</span>
                <span className="font-bold text-slate-800 text-sm">{candidate.age} वर्षे • {candidate.height}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">वर्ण व रक्तगट</span>
                <span className="font-bold text-slate-800 text-sm">{candidate.complexion || 'गोरा'} • {candidate.blood || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">जन्म दिनांक</span>
                <span className="font-bold text-slate-800 text-sm">{candidate.date || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">जन्म वेळ</span>
                <span className="font-bold text-slate-800 text-sm">{candidate.time || 'N/A'}</span>
              </div>
            </div>

            {/* Education & Family Info Grid (Adjusted for compact balance) */}
            <div className={`grid grid-cols-1 ${candidate.fam ? 'md:grid-cols-2' : ''} gap-3`}>
              {/* Education & Occupation */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-500" />
                  शिक्षण व नोकरी / व्यवसाय
                </h4>
                <p className="text-slate-800 font-medium text-sm whitespace-pre-line leading-relaxed">
                  {candidate.edu || 'माहिती उपलब्ध नाही'}
                </p>
              </div>

              {/* Family Details */}
              {candidate.fam && (
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    कौटुंबिक माहिती (भाऊ / बहिण)
                  </h4>
                  <p className="text-slate-800 font-medium text-sm whitespace-pre-line leading-relaxed">
                    {candidate.fam}
                  </p>
                </div>
              )}
            </div>

            {/* Expectations */}
            {candidate.exp && (
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  अपेक्षा (Expectations)
                </h4>
                <p className="text-slate-800 font-medium text-sm">
                  {candidate.exp}
                </p>
              </div>
            )}

            {/* Structured Contact Persons with Name, Address, Mobile, WhatsApp & Call */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-700" />
                  संपर्क व्यक्ती, पत्ते व मोबाईल नंबर ({contacts.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 underline underline-offset-2 font-medium"
                >
                  <FileText className="w-3 h-3" />
                  {showRawText ? 'मूळ मजकूर लपवा' : 'मूळ पुस्तिका मजकूर पहा'}
                </button>
              </div>

              {/* List of Contact Persons */}
              <div className="grid grid-cols-1 gap-3">
                {contacts.map((person, idx) => {
                  const proposalParams = {
                    candidateName: candidate.name,
                    guardianName: person.name,
                    listNumber: candidate.sr
                  };
                  const waLink = person.phoneClean
                    ? getProposalWhatsAppUrl(person.phoneClean, proposalParams)
                    : null;
                  const callLink = person.phoneClean ? `tel:${person.phoneClean}` : null;

                  const handleCopyProposal = () => {
                    const message = buildCandidateProposalMessage(proposalParams);
                    navigator.clipboard.writeText(message);
                    setCopiedContactIdx(idx);
                    setTimeout(() => setCopiedContactIdx(null), 2500);
                  };

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-amber-200/80 space-y-2.5 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          {/* Person Name */}
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <User className="w-4 h-4 flex-shrink-0 text-amber-600" />
                            <span>{person.name || 'पालक / संपर्क'}</span>
                          </div>

                          {/* Person Address */}
                          {person.address && (
                            <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-1 ml-7">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{person.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Clean Phone Number */}
                        {person.phoneClean && (
                          <div className="self-start sm:self-auto text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            📞 {person.phoneClean}
                          </div>
                        )}
                      </div>

                      {/* WhatsApp, Copy & Call Buttons (Adjusted equal 3-column layout) */}
                      {person.phoneClean && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
                              title="WhatsApp वर मेसेज पाठवा"
                            >
                              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">WhatsApp</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={handleCopyProposal}
                            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 text-xs font-bold transition-all border border-amber-200 shadow-xs cursor-pointer"
                            title="पालकांसाठी प्रस्ताव मेसेज कॉपी करा"
                          >
                            {copiedContactIdx === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                                <span className="text-emerald-800 truncate">कॉपी झाले!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                                <span className="truncate">मेसेज कॉपी</span>
                              </>
                            )}
                          </button>

                          {callLink && (
                            <a
                              href={callLink}
                              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
                              title="थेट कॉल करा"
                            >
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">कॉल</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Optional Raw Text View */}
              {showRawText && (
                <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-600 font-mono whitespace-pre-line leading-relaxed">
                  {candidate.contact}
                </div>
              )}
            </div>

            {/* Notes & Custom Tags */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  खाजगी टीप (Private Notes - Auto-saved)
                </label>
                <textarea
                  rows={3}
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="येथे स्वतःच्या नोंदी लिहा (उदा. 'पालकांशी बोलणे झाले, पत्रिका जुळते, रविवारी भेटायचे आहे')..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  कस्टम टॅग्ज (Tags)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{t}</span>
                      <button
                        onClick={() => onRemoveTag(candidate.id, t)}
                        className="hover:text-rose-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-slate-400 italic">कोणतेही टॅग्ज जोडलेले नाहीत.</span>
                  )}
                </div>

                <form onSubmit={handleAddTagSubmit} className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="टॅग जोडा (उदा. प्राधान्य, पुणे, इंजिनिअर)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={!newTagInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> जोडा
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Triage Decision Section */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Triage Decision
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleShortlist}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'shortlisted'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${status === 'shortlisted' ? 'fill-white' : ''}`} />
                <span>Shortlist</span>
              </button>

              <button
                onClick={() => onStatusChange(candidate.id, status === 'review' ? 'default' : 'review')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'review'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Review</span>
              </button>

              <button
                onClick={() => onStatusChange(candidate.id, status === 'contacted' ? 'default' : 'contacted')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'contacted'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Called</span>
              </button>

              <button
                onClick={() => onStatusChange(candidate.id, status === 'not_interested' ? 'default' : 'not_interested')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'not_interested'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Pass</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
