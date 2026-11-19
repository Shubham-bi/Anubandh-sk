import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Briefcase,
  GraduationCap,
  FileText,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  StickyNote,
  Tag,
  Plus,
  Share2,
  ZoomIn,
  ZoomOut,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Profile, ProfileInteraction, TriageStatus } from '../types/profile';
import { getWhatsAppLink, getTelLink } from '../utils/formatters';

interface ProfileModalProps {
  profile: Profile | null;
  interaction?: ProfileInteraction;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (nu_id: string, status: TriageStatus) => void;
  onRatingChange: (nu_id: string, rating: number) => void;
  onNotesChange: (nu_id: string, notes: string) => void;
  onAddTag: (nu_id: string, tag: string) => void;
  onRemoveTag: (nu_id: string, tag: string) => void;
  onToggleCompare: (nu_id: string) => void;
  isCompared: boolean;
  onShareFamily?: (profile: Profile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  interaction,
  isOpen,
  onClose,
  onStatusChange,
  onRatingChange,
  onNotesChange,
  onAddTag,
  onRemoveTag,
  onToggleCompare,
  isCompared,
  onShareFamily
}) => {
  const [activeTab, setActiveTab] = useState<'kundali' | 'family' | 'career' | 'personal' | 'documents' | 'notes'>('kundali');
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('contain');
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [newTagInput, setNewTagInput] = useState('');
  const [localNotes, setLocalNotes] = useState('');

  const photos = profile?.photos || [];
  const currentPhoto = photos.length > 0 ? photos[currentPhotoIdx] : null;

  useEffect(() => {
    if (interaction?.notes) {
      setLocalNotes(interaction.notes);
    } else {
      setLocalNotes('');
    }
    setCurrentPhotoIdx(0);
    setImageFitMode('contain');
    setLightboxZoom(1);
    setActiveTab('kundali');
  }, [profile?.nu_id, interaction?.notes]);

  // Handle escape & arrow keys for lightbox navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
          setLightboxZoom(1);
        } else {
          onClose();
        }
      } else if (lightboxImage && photos.length > 1) {
        if (e.key === 'ArrowLeft') {
          setCurrentPhotoIdx((prev) => {
            const next = prev > 0 ? prev - 1 : photos.length - 1;
            setLightboxImage(photos[next]);
            return next;
          });
        } else if (e.key === 'ArrowRight') {
          setCurrentPhotoIdx((prev) => {
            const next = prev < photos.length - 1 ? prev + 1 : 0;
            setLightboxImage(photos[next]);
            return next;
          });
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lightboxImage, onClose, photos]);

  if (!isOpen || !profile) return null;

  const status = interaction?.status || 'default';
  const rating = interaction?.rating || 0;
  const tags = interaction?.tags || [];

  const handleNotesBlur = () => {
    if (localNotes !== interaction?.notes) {
      onNotesChange(profile.nu_id, localNotes);
    }
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      onAddTag(profile.nu_id, newTagInput.trim());
      setNewTagInput('');
    }
  };

  const handleShortlist = () => {
    const next = status === 'shortlisted' ? 'default' : 'shortlisted';
    onStatusChange(profile.nu_id, next);
    if (next === 'shortlisted') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback if canvas is not supported
      }
    }
  };

  const whatsAppUrl = profile.mobile1 ? getWhatsAppLink(profile.mobile1, profile.name) : null;
  const phoneUrl = profile.mobile1 ? getTelLink(profile.mobile1) : null;
  const fatherPhoneUrl = profile.fatherMobile ? getTelLink(profile.fatherMobile) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              ID: {profile.nu_id}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Registered Profile
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onShareFamily && (
              <button
                onClick={() => onShareFamily(profile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
                title="कौटुंबिक चर्चा पत्रिका / PDF तयार करा"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">कौटुंबिक पत्रिका</span>
                <span className="sm:hidden">शेअर</span>
              </button>
            )}

            {/* Compare Toggle */}
            <button
              onClick={() => onToggleCompare(profile.nu_id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCompared
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{isCompared ? 'In Compare' : 'Compare'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          {/* Hero Section: Photo Gallery & Essential Overview */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-b from-slate-50/50 to-white">
            {/* Left Photo Carousel (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div
                onClick={() => currentPhoto && setLightboxImage(currentPhoto)}
                className="relative min-h-[300px] sm:min-h-[380px] md:min-h-[440px] max-h-[500px] w-full rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200 shadow-sm group flex items-start justify-center cursor-zoom-in"
                title="मोठा फोटो पाहण्यासाठी क्लिक करा (Click to view full size)"
              >
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt={profile.name}
                    className={`w-full h-full object-top transition-all duration-300 ${
                      imageFitMode === 'contain' ? 'object-contain' : 'object-cover'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-rose-50 text-rose-400">
                    <span className="text-5xl font-black">{profile.firstname?.[0] || 'L'}</span>
                    <span className="text-xs font-medium mt-2">No Photo</span>
                  </div>
                )}

                {/* Fit / Cover Mode Toggle */}
                {currentPhoto && (
                  <div
                    className="absolute top-3 left-3 z-10 flex items-center bg-black/60 backdrop-blur-md rounded-lg p-0.5 text-[11px] font-bold text-white shadow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setImageFitMode('contain')}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        imageFitMode === 'contain' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                      }`}
                      title="पूर्ण आकार (Full Size / Uncropped)"
                    >
                      पूर्ण आकार
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFitMode('cover')}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        imageFitMode === 'cover' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                      }`}
                      title="कव्हर / झूम (Fill / Cover)"
                    >
                      कव्हर
                    </button>
                  </div>
                )}

                {/* Lightbox Trigger Badge */}
                {currentPhoto && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(currentPhoto);
                    }}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/85 transition-colors backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold shadow-md z-10"
                    title="पूर्ण आकाराचा मोठा फोटो उघडा (View Fullscreen)"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden sm:inline">मोठा फोटो</span>
                  </button>
                )}

                {/* Carousel Prev/Next Buttons */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors shadow-md z-10"
                      title="मागील फोटो"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors shadow-md z-10"
                      title="पुढील फोटो"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPhotoIdx(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        currentPhotoIdx === idx
                          ? 'border-rose-600 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Overview Details (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
                    <p className="text-sm font-semibold text-rose-600 mt-0.5">
                      {profile.gotra} {profile.mamkul ? `(Mamkul: ${profile.mamkul})` : ''}
                    </p>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onRatingChange(profile.nu_id, rating === star ? 0 : star)}
                        className="text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${rating >= star ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Quick Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Age & Height</span>
                    <span className="font-bold text-slate-800">{profile.age} yrs • {profile.height}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Annual Income</span>
                    <span className="font-extrabold text-emerald-700">{profile.income_label}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Current Location</span>
                    <span className="font-bold text-slate-800 truncate block">{profile.currentCity}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Education</span>
                    <span className="font-bold text-slate-800 truncate block">{profile.education}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Occupation</span>
                    <span className="font-bold text-slate-800 truncate block">{profile.occupation}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Native District</span>
                    <span className="font-bold text-slate-800 truncate block">{profile.nativeDistrict || 'Leva'}</span>
                  </div>
                </div>

                {/* Direct Action Buttons: WhatsApp & Call */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {whatsAppUrl && (
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Profile</span>
                    </a>
                  )}
                  {phoneUrl && (
                    <a
                      href={phoneUrl}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Mobile ({profile.mobile1})</span>
                    </a>
                  )}
                  {fatherPhoneUrl && (
                    <a
                      href={fatherPhoneUrl}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Father ({profile.fatherMobile})</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Triage Decision Bar */}
              <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Triage Decision
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={handleShortlist}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'shortlisted'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${status === 'shortlisted' ? 'fill-white' : ''}`} />
                    <span>Shortlist</span>
                  </button>

                  <button
                    onClick={() => onStatusChange(profile.nu_id, status === 'review' ? 'default' : 'review')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'review'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>

                  <button
                    onClick={() => onStatusChange(profile.nu_id, status === 'contacted' ? 'default' : 'contacted')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'contacted'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contacted</span>
                  </button>

                  <button
                    onClick={() => onStatusChange(profile.nu_id, status === 'not_interested' ? 'default' : 'not_interested')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
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

          {/* Deep Tabs Section */}
          <div>
            {/* Tab Navigation Strip */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 overflow-x-auto thin-scrollbar bg-slate-50/50">
              {[
                { id: 'kundali', label: 'Kundali & Astrology', icon: Sparkles },
                { id: 'family', label: 'Family & Native', icon: Calendar },
                { id: 'career', label: 'Career & Education', icon: Briefcase },
                { id: 'personal', label: 'Personal & Bio', icon: GraduationCap },
                { id: 'documents', label: `Documents (${profile.biodatas.length})`, icon: FileText },
                { id: 'notes', label: 'Notes & Tags', icon: StickyNote },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-shrink-0 flex items-center gap-1.5 py-2.5 px-3.5 font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-rose-600 text-rose-600 bg-white rounded-t-xl shadow-sm'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panes */}
            <div className="p-4 sm:p-6 text-sm">
              {/* Tab: Kundali & Astrology */}
              {activeTab === 'kundali' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Gotra</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.gotra}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Mamkul</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.mamkul || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Birth Date</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.birthdate || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Birth Time</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.birthtime || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Birth Place</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.birthplace || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Zodiac / Rashi</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.zodiac || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Mangal / Manglik</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.mangal || 'No'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Blood Group</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Height</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.height} ({profile.height_cm} cm)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Family & Native */}
              {activeTab === 'family' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Father's Name</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.fatherName || 'N/A'}</span>
                      <p className="text-xs text-slate-500 mt-1">Occupation: {profile.fatherOccupation || 'N/A'}</p>
                      {profile.fatherMobile && (
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">📞 {profile.fatherMobile}</p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Mother's Name</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.motherName || 'N/A'}</span>
                      <p className="text-xs text-slate-500 mt-1">Occupation: {profile.motherOccupation || 'Housewife'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Brothers</span>
                      <span className="font-semibold text-slate-800 text-sm">{profile.brothers}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Sisters</span>
                      <span className="font-semibold text-slate-800 text-sm">{profile.sisters}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Mama / Uncle</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.uncleName || 'N/A'}</span>
                      <p className="text-xs text-slate-500 mt-1">Place: {profile.unclePlace || 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Native Place & Taluka</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {profile.nativePlace || 'N/A'} {profile.nativeTaluka ? `(Tal: ${profile.nativeTaluka})` : ''}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">District: {profile.nativeDistrict || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Career & Education */}
              {activeTab === 'career' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Education</span>
                      <span className="font-bold text-slate-800 text-base">{profile.education}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Annual Income</span>
                      <span className="font-black text-emerald-700 text-base">{profile.income_label}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Occupation / Profession</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.occupation}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Current Working City</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.currentCity}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Personal & Bio */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Marital Status</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.maritalStatus}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Complexion</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.complexion || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Physical Disability</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.handicap}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Height</span>
                      <span className="font-bold text-slate-800 text-sm">{profile.height}</span>
                    </div>
                  </div>

                  {profile.about && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">About Profile</h4>
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{profile.about}</p>
                    </div>
                  )}

                  {profile.expectations && (
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                      <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Partner Expectations</h4>
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{profile.expectations}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Documents & Scanned Biodatas */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {profile.biodatas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.biodatas.map((bioUrl, idx) => (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-2 group hover:shadow-md transition-all"
                        >
                          <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden mb-2">
                            <img src={bioUrl} alt={`Biodata Document ${idx + 1}`} className="w-full h-full object-contain object-top" />
                            <button
                              onClick={() => setLightboxImage(bioUrl)}
                              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs gap-1.5 transition-opacity"
                            >
                              <Maximize2 className="w-4 h-4" /> Click to Zoom
                            </button>
                          </div>
                          <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-semibold text-slate-700">Biodata #{idx + 1}</span>
                            <a
                              href={bioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-rose-600 font-bold hover:underline"
                            >
                              Open Full
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No scanned biodata documents attached for this profile.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Notes & Tags */}
              {activeTab === 'notes' && (
                <div className="space-y-5">
                  {/* Notes Editor */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Private Notes (Auto-saved)
                    </label>
                    <textarea
                      rows={4}
                      value={localNotes}
                      onChange={(e) => setLocalNotes(e.target.value)}
                      onBlur={handleNotesBlur}
                      placeholder="Add personal notes here (e.g. 'Spoke to father on Monday, horoscope matches, expecting photo from uncle')..."
                      className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Notes are stored privately on this device and included in CSV exports.
                    </span>
                  </div>

                  {/* Custom Tags */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Custom Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                          <button
                            onClick={() => onRemoveTag(profile.nu_id, tag)}
                            className="hover:text-rose-900 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {tags.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No custom tags added yet.</span>
                      )}
                    </div>

                    <form onSubmit={handleAddTagSubmit} className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        placeholder="Add tag (e.g. High Priority, Doctor, Pune)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        type="submit"
                        disabled={!newTagInput.trim()}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal with Full-Size Viewer */}
      {lightboxImage && (
        <div
          onClick={() => {
            setLightboxImage(null);
            setLightboxZoom(1);
          }}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 select-none animate-in fade-in"
        >
          {/* Lightbox Top Control Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between gap-3 text-white z-20 pb-2 border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-white/15 px-3 py-1 rounded-lg">
                {profile.name}
              </span>
              {photos.length > 1 && (
                <span className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded-lg">
                  फोटो {currentPhotoIdx + 1} / {photos.length}
                </span>
              )}
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(1)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                title="Reset Zoom"
              >
                {Math.round(lightboxZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <a
                href={lightboxImage}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-medium"
                title="मूळ फोटो नवीन टॅबमध्ये उघडा (Open raw image in new tab)"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">मूळ फोटो</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setLightboxImage(null);
                  setLightboxZoom(1);
                }}
                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Center Container */}
          <div
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2 relative my-auto cursor-zoom-out"
          >
            <img
              src={lightboxImage}
              alt={profile.name}
              style={{ transform: `scale(${lightboxZoom})`, transformOrigin: 'top center' }}
              className="max-w-full max-h-[82vh] object-contain object-top rounded-xl shadow-2xl transition-transform duration-150"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxZoom((z) => (z === 1 ? 1.75 : 1));
              }}
            />

            {/* Prev / Next photo buttons inside Lightbox */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = currentPhotoIdx > 0 ? currentPhotoIdx - 1 : photos.length - 1;
                    setCurrentPhotoIdx(nextIdx);
                    setLightboxImage(photos[nextIdx]);
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-colors"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = currentPhotoIdx < photos.length - 1 ? currentPhotoIdx + 1 : 0;
                    setCurrentPhotoIdx(nextIdx);
                    setLightboxImage(photos[nextIdx]);
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-colors"
                  title="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Footer Caption */}
          <div className="text-center text-xs text-slate-400 pb-1 z-20">
            <span>फोटो झूम करण्यासाठी क्लिक करा • डावे/उजवे बाण वापरून फोटो बदला • Esc दाबून बंद करा</span>
          </div>
        </div>
      )}
    </div>
  );
};
