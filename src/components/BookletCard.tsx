import React from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  GraduationCap,
  Users,
  StickyNote,
  User,
  MapPin,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookletCandidate, parseCandidateContacts } from '../types/candidate';
import { ProfileInteraction, TriageStatus } from '../types/profile';
import { getProposalWhatsAppUrl } from '../utils/messages';

interface BookletCardProps {
  candidate: BookletCandidate;
  interaction?: ProfileInteraction;
  onSelect: () => void;
  onStatusChange: (id: string, status: TriageStatus) => void;
  onRatingChange: (id: string, rating: number) => void;
  onShareFamily?: (candidate: BookletCandidate) => void;
}

export const BookletCardComponent: React.FC<BookletCardProps> = ({
  candidate,
  interaction,
  onSelect,
  onStatusChange,
  onRatingChange,
  onShareFamily
}) => {
  const status = interaction?.status || 'default';
  const rating = interaction?.rating || 0;
  const hasNotes = Boolean(interaction?.notes?.trim());
  const tags = interaction?.tags || [];

  const handleShortlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = status === 'shortlisted' ? 'default' : 'shortlisted';
    onStatusChange(candidate.id, next);
    if (next === 'shortlisted') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#e11d48', '#10b981', '#f59e0b']
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleStatusClick = (e: React.MouseEvent, target: TriageStatus) => {
    e.stopPropagation();
    const next = status === target ? 'default' : target;
    onStatusChange(candidate.id, next);
  };

  const handleRatingClick = (e: React.MouseEvent, r: number) => {
    e.stopPropagation();
    onRatingChange(candidate.id, rating === r ? 0 : r);
  };

  // Parse structured contact persons
  const contacts = parseCandidateContacts(candidate.contact, candidate.phones);

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-2xl border p-4 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative ${
        status === 'shortlisted'
          ? 'border-emerald-300 ring-2 ring-emerald-500/30'
          : status === 'not_interested'
          ? 'border-slate-200 opacity-65 bg-slate-50'
          : 'border-slate-200 hover:border-rose-300'
      }`}
    >
      <div>
        {/* Top Badges & Serial */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              {candidate.sr || candidate.id}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {candidate.mulgaon}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status Badge */}
            {status === 'shortlisted' && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> Shortlisted
              </span>
            )}
            {status === 'review' && (
              <span className="bg-amber-50 text-amber-700 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Review
              </span>
            )}
            {status === 'contacted' && (
              <span className="bg-blue-50 text-blue-700 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-600" /> Called
              </span>
            )}
            {status === 'not_interested' && (
              <span className="bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-600" /> Pass
              </span>
            )}

            {onShareFamily && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShareFamily(candidate);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors"
                title="कौटुंबिक पत्रिका / WhatsApp वर शेअर करा"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Candidate Avatar & Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/20">
            {candidate.name.replace(/कु\.?\s*/, '').trim()?.[0] || 'ल'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug truncate">
              {candidate.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
              <span className="font-bold text-slate-800">{candidate.age} वर्षे</span>
              <span>•</span>
              <span>उंची: {candidate.height}</span>
              {candidate.blood && (
                <>
                  <span>•</span>
                  <span className="text-rose-600 font-bold">{candidate.blood}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Gotra & Mamkul Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-bold border border-rose-100">
            गोत्र: {candidate.gotra}
          </span>
          {candidate.mamkul && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
              मामकूळ: {candidate.mamkul}
            </span>
          )}
        </div>

        {/* Education & Job excerpt */}
        <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed whitespace-pre-line font-medium">
              {candidate.edu}
            </p>
          </div>
          {candidate.fam && (
            <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
              <Users className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="line-clamp-1 truncate font-medium">
                {candidate.fam.replace(/\n/g, ' • ')}
              </p>
            </div>
          )}
        </div>

        {/* Contact Persons, Addresses & Direct Phone Box (All contacts displayed) */}
        {contacts.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 mb-3 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
              <span className="text-[11px] font-extrabold text-amber-950 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>संपर्क व्यक्ती ({contacts.length})</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-600" /> थेट व्हॉट्सॲप / कॉल
              </span>
            </div>

            <div className="space-y-2">
              {contacts.map((contact, idx) => {
                const waLink = contact.phoneClean
                  ? getProposalWhatsAppUrl(contact.phoneClean, {
                      candidateName: candidate.name,
                      guardianName: contact.name,
                      listNumber: candidate.sr
                    })
                  : null;
                const callLink = contact.phoneClean ? `tel:${contact.phoneClean}` : null;

                return (
                  <div
                    key={idx}
                    className="bg-white p-2.5 rounded-xl border border-amber-200/70 shadow-xs space-y-2"
                  >
                    {/* Contact Person Name & Address */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <User className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                        <span className="truncate">{contact.name}</span>
                      </div>

                      {contact.address && (
                        <div className="flex items-start gap-1 text-[11px] text-slate-500 mt-0.5 ml-5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{contact.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone & Direct Action Buttons */}
                    {contact.phoneClean && (
                      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                        <a
                          href={callLink || '#'}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1 tracking-wide"
                          title="कॉल करा"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{contact.phoneClean}</span>
                        </a>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                              title="WhatsApp वर मेसेज करा"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {callLink && (
                            <a
                              href={callLink}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                              title="थेट कॉल करा"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags & Note Indicator */}
        {(hasNotes || tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {hasNotes && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <StickyNote className="w-3 h-3" /> टीप (Note)
              </span>
            )}
            {tags.map((t) => (
              <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Rating Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400">रेटिंग (Rating):</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => handleRatingClick(e, star)}
                className="p-0.5 text-slate-300 hover:text-amber-400 transition-colors"
                title={`Rate ${star} Stars`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    rating >= star ? 'text-amber-400 fill-amber-400' : ''
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Triage Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={handleShortlist}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'shortlisted'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 mb-0.5 ${status === 'shortlisted' ? 'fill-white' : ''}`} />
            <span className="text-[10px]">Shortlist</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleStatusClick(e, 'review')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'review'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px]">Review</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleStatusClick(e, 'contacted')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'contacted'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Phone className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px]">Called</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleStatusClick(e, 'not_interested')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'not_interested'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px]">Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const BookletCard = React.memo(BookletCardComponent);
