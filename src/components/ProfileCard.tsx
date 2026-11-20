import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Camera,
  StickyNote,
  MessageCircle,
  Share2,
  Maximize2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Profile, ProfileInteraction, TriageStatus } from '../types/profile';
import { getWhatsAppLink, getTelLink } from '../utils/formatters';

interface ProfileCardProps {
  profile: Profile;
  interaction?: ProfileInteraction;
  isCompared: boolean;
  onSelect: () => void;
  onStatusChange: (nu_id: string, status: TriageStatus) => void;
  onRatingChange: (nu_id: string, rating: number) => void;
  onToggleCompare: (nu_id: string) => void;
  compact?: boolean;
  onShareFamily?: (profile: Profile) => void;
}

export const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  profile,
  interaction,
  isCompared,
  onSelect,
  onStatusChange,
  onRatingChange,
  onToggleCompare,
  compact = false,
  onShareFamily
}) => {
  const [imageError, setImageError] = useState(false);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const status = interaction?.status || 'default';
  const rating = interaction?.rating || 0;
  const hasNotes = Boolean(interaction?.notes?.trim());
  const tags = interaction?.tags || [];

  const mainPhoto = profile.photos && profile.photos.length > 0 ? profile.photos[0] : null;

  const handleShortlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = status === 'shortlisted' ? 'default' : 'shortlisted';
    onStatusChange(profile.nu_id, nextStatus);

    if (nextStatus === 'shortlisted') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#e11d48', '#10b981', '#f59e0b']
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleStatusClick = (e: React.MouseEvent, target: TriageStatus) => {
    e.stopPropagation();
    const next = status === target ? 'default' : target;
    onStatusChange(profile.nu_id, next);
  };

  const handleRatingClick = (e: React.MouseEvent, r: number) => {
    e.stopPropagation();
    onRatingChange(profile.nu_id, rating === r ? 0 : r);
  };

  const handleCompareClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    onToggleCompare(profile.nu_id);
  };

  const whatsAppUrl = profile.mobile1 ? getWhatsAppLink(profile.mobile1, profile.name) : null;
  const phoneUrl = profile.mobile1 ? getTelLink(profile.mobile1) : null;

  if (compact) {
    return (
      <div
        onClick={onSelect}
        className={`group bg-white rounded-xl border p-3 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 ${
          status === 'shortlisted'
            ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400/40'
            : status === 'not_interested'
            ? 'border-slate-200 opacity-60 bg-slate-50'
            : 'border-slate-200 hover:border-rose-200'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={handleCompareClick}
            onClick={(e) => e.stopPropagation()}
            className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
            title="Select for comparison"
          />

          {/* Avatar Thumbnail */}
          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative border border-slate-200">
            {mainPhoto && !imageError ? (
              <img
                src={mainPhoto}
                alt={profile.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-rose-100 to-pink-50 text-rose-700 font-bold flex items-center justify-center text-sm">
                {profile.firstname?.[0] || 'L'}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 truncate">{profile.name}</h3>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {profile.age} yrs • {profile.height}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-semibold text-rose-600 truncate">{profile.gotra}</span>
              <span>•</span>
              <span className="truncate">{profile.education}</span>
              <span>•</span>
              <span className="font-bold text-emerald-600">{profile.income_label}</span>
              <span>•</span>
              <span className="truncate">{profile.currentCity}</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onShareFamily && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareFamily(profile);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="कौटुंबिक पत्रिका / WhatsApp वर शेअर करा"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleShortlist}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === 'shortlisted'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title="Shortlist"
          >
            <Star className={`w-4 h-4 ${status === 'shortlisted' ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={(e) => handleStatusClick(e, 'review')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === 'review'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
            }`}
            title="Mark for Review"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleStatusClick(e, 'not_interested')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === 'not_interested'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title="Not Interested"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative ${
        status === 'shortlisted'
          ? 'border-emerald-300 ring-2 ring-emerald-500/30'
          : status === 'not_interested'
          ? 'border-slate-200 opacity-65 bg-slate-50'
          : 'border-slate-200 hover:border-rose-300'
      }`}
    >
      {/* Top Banner Image Container */}
      <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
        {mainPhoto && !imageError ? (
          <img
            src={mainPhoto}
            alt={profile.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-rose-100 via-pink-50 to-amber-50 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-2xl font-black text-rose-600 shadow-inner">
              {profile.firstname?.[0] || 'L'}
            </div>
            <span className="text-xs font-medium mt-2 text-slate-500">No Photo Available</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top-left Badges (Comparison & Photo Counts) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <label
            onClick={(e) => e.stopPropagation()}
            className="bg-black/50 backdrop-blur-md text-white p-1 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-black/70 transition-colors"
            title="Select to compare"
          >
            <input
              type="checkbox"
              checked={isCompared}
              onChange={handleCompareClick}
              className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
            />
            <span className="text-[10px] font-semibold pr-1">Compare</span>
          </label>

          {profile.photos.length > 1 && (
            <span className="bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {profile.photos.length}
            </span>
          )}

          {profile.biodatas.length > 0 && (
            <span className="bg-rose-950/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
              <FileText className="w-3 h-3 text-rose-300" />
              Biodata
            </span>
          )}
        </div>

        {/* Top-right Status Pill & Share Button */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {mainPhoto && !imageError && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullPhoto(true);
              }}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors shadow-sm"
              title="पूर्ण आकाराचा मोठा फोटो पहा (View Full Size Photo)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onShareFamily && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShareFamily(profile);
              }}
              className="p-1.5 rounded-full bg-black/50 hover:bg-rose-600 text-white backdrop-blur-md transition-colors shadow-sm"
              title="कौटुंबिक पत्रिका / WhatsApp वर शेअर करा"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {status === 'shortlisted' && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Shortlisted
            </span>
          )}
          {status === 'review' && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Under Review
            </span>
          )}
          {status === 'contacted' && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Contacted
            </span>
          )}
          {status === 'not_interested' && (
            <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Excluded
            </span>
          )}
        </div>

        {/* Bottom Overlay Info on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-extrabold text-lg tracking-tight truncate drop-shadow-md">
              {profile.name}
            </h3>
            <span className="text-sm font-semibold text-rose-200 drop-shadow">
              {profile.age} yrs
            </span>
          </div>
          <p className="text-xs text-white/90 drop-shadow flex items-center gap-1.5 mt-0.5">
            <span>{profile.height}</span>
            <span>•</span>
            <span className="bg-white/20 backdrop-blur-md px-1.5 py-0.2 rounded text-[11px] font-semibold text-white">
              {profile.gotra}
            </span>
          </p>
        </div>
      </div>

      {/* Profile Details Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Education & Occupation */}
          <div className="flex items-start gap-2 text-xs text-slate-700">
            <GraduationCap className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold break-words leading-snug">{profile.education}</span>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-700">
            <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span className="break-words leading-snug">{profile.occupation}</span>
          </div>

          {/* Income & Location */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs text-slate-600 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{profile.currentCity}</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {profile.income_label}
            </span>
          </div>

          {/* Tags & Notes indicator */}
          {(hasNotes || tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {hasNotes && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <StickyNote className="w-2.5 h-2.5" /> Note
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rating and Direct Contacts */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {/* 5-star rating */}
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

          {/* Direct Communication */}
          <div className="flex items-center gap-1.5">
            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Message on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
            {phoneUrl && (
              <a
                href={phoneUrl}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Call Profile Mobile"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Triage Action Button Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-2">
          {/* Shortlist */}
          <button
            type="button"
            onClick={handleShortlist}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'shortlisted'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
            title="Shortlist Profile"
          >
            <Star className={`w-3.5 h-3.5 mb-0.5 ${status === 'shortlisted' ? 'fill-white' : ''}`} />
            <span className="text-[10px]">Shortlist</span>
          </button>

          {/* Review */}
          <button
            type="button"
            onClick={(e) => handleStatusClick(e, 'review')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'review'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
            title="Mark as Review Later"
          >
            <Clock className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px]">Review</span>
          </button>

          {/* Contacted */}
          <button
            type="button"
            onClick={(e) => handleStatusClick(e, 'contacted')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'contacted'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            title="Mark as Contacted"
          >
            <Phone className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[10px]">Called</span>
          </button>

          {/* Not Interested */}
          <button
            type="button"
            onClick={(e) => handleStatusClick(e, 'not_interested')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              status === 'not_interested'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
            title="Mark as Not Interested"
          >
            <XCircle className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[9px] leading-tight text-center">Not Interested</span>
          </button>
        </div>
      </div>

      {/* Quick Full Photo Lightbox */}
      {showFullPhoto && mainPhoto && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowFullPhoto(false);
          }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 cursor-zoom-out animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl flex items-center justify-between text-white mb-2 z-10"
          >
            <span className="font-bold text-xs sm:text-sm bg-white/15 px-3 py-1 rounded-lg">
              {profile.name} (ID: {profile.nu_id})
            </span>
            <div className="flex items-center gap-2">
              <a
                href={mainPhoto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg transition-colors font-medium text-white"
                title="Open original image in new tab"
              >
                मूळ फोटो
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullPhoto(false);
                }}
                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <img
            src={mainPhoto}
            alt={profile.name}
            className="max-w-full max-h-[85vh] object-contain object-top rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export const ProfileCard = React.memo(ProfileCardComponent);
