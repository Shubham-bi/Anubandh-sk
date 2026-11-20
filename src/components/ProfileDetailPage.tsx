import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
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
  ZoomIn,
  ZoomOut,
  ExternalLink,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Profile, ProfileInteraction, TriageStatus } from '../types/profile';
import { getWhatsAppLink, getTelLink } from '../utils/formatters';

interface ProfileDetailPageProps {
  profile: Profile;
  interaction?: ProfileInteraction;
  onBack: () => void;
  onStatusChange: (nu_id: string, status: TriageStatus) => void;
  onRatingChange: (nu_id: string, rating: number) => void;
  onNotesChange: (nu_id: string, notes: string) => void;
  onAddTag: (nu_id: string, tag: string) => void;
  onRemoveTag: (nu_id: string, tag: string) => void;
  onToggleCompare: (nu_id: string) => void;
  isCompared: boolean;
  onShareFamily?: (profile: Profile) => void;
}

export const ProfileDetailPage: React.FC<ProfileDetailPageProps> = ({
  profile,
  interaction,
  onBack,
  onStatusChange,
  onRatingChange,
  onNotesChange,
  onAddTag,
  onRemoveTag,
  onToggleCompare,
  isCompared,
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [profile?.nu_id, interaction?.notes]);

  // Handle escape & arrow keys for lightbox navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
          setLightboxZoom(1);
        } else {
          onBack();
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, onBack, photos]);

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
        // Fallback
      }
    }
  };

  const whatsAppUrl = profile.mobile1
    ? getWhatsAppLink(profile.mobile1, profile.name, profile.fatherName, profile.nu_id)
    : null;
  const phoneUrl = profile.mobile1 ? getTelLink(profile.mobile1) : null;
  const fatherPhoneUrl = profile.fatherMobile ? getTelLink(profile.fatherMobile) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-200">
      {/* Sticky Top Navigation & Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>मागे (Back)</span>
          </button>

          {/* Profile Name & Quick Summary */}
          <div className="min-w-0 text-center flex-1 px-2">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 truncate">
              {profile.name}
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold truncate hidden sm:block">
              ID: {profile.nu_id} • {profile.age} वर्षे • {profile.gotra} • {profile.currentCity}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
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
              <span className="hidden sm:inline">{isCompared ? 'In Compare' : 'Compare'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
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
                    <span>Not Int.</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-slate-50 px-4 sm:px-6 border-b border-slate-200">
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
              <button
                onClick={() => setActiveTab('kundali')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'kundali'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>कुंडली व गोत्र</span>
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'family'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span>कौटुंबिक माहिती</span>
              </button>

              <button
                onClick={() => setActiveTab('career')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'career'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>शिक्षण व नोकरी</span>
              </button>

              <button
                onClick={() => setActiveTab('personal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'personal'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>व्यक्तिगत माहिती</span>
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'documents'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>कागदपत्रे / बायोडाटा</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'notes'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <StickyNote className="w-4 h-4 text-indigo-600" />
                <span>टीपा व टॅग्ज</span>
                {(tags.length > 0 || localNotes.trim()) && (
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content Panes */}
          <div className="p-4 sm:p-6 text-xs sm:text-sm">
            {/* Kundali & Gotra Tab */}
            {activeTab === 'kundali' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">गोत्र (Gotra)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.gotra}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">मामकुळ (Mamkul)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.mamkul || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">जन्म तारीख (Birth Date)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.birthdate || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">जन्म वेळ (Birth Time)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.birthtime || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">जन्म ठिकाण (Birth Place)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.birthplace || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">रास (Rashi / Zodiac)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.zodiac || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">मंगळ (Mangal)</span>
                    <span className={`font-bold text-sm ${profile.mangal?.toLowerCase().includes('yes') || profile.mangal?.includes('आहे') ? 'text-rose-600' : 'text-slate-900'}`}>
                      {profile.mangal || 'उपलब्ध नाही'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Family & Native Tab */}
            {activeTab === 'family' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">वडिलांचे नाव व व्यवसाय</span>
                    <span className="font-bold text-slate-900 block text-sm">{profile.fatherName || 'उपलब्ध नाही'}</span>
                    <span className="text-xs text-slate-600">{profile.fatherOccupation}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">आईचे नाव व व्यवसाय</span>
                    <span className="font-bold text-slate-900 block text-sm">{profile.motherName || 'उपलब्ध नाही'}</span>
                    <span className="text-xs text-slate-600">{profile.motherOccupation}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">भाऊ (Brothers)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.brothers || 'नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">बहिणी (Sisters)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.sisters || 'नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">मूळ गाव (Native Place)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.nativePlace || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">मूळ तालुका व जिल्हा</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {profile.nativeTaluka ? `ता. ${profile.nativeTaluka}, ` : ''}जि. {profile.nativeDistrict || 'उपलब्ध नाही'}
                    </span>
                  </div>
                </div>

                {profile.uncleName && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <span className="text-[11px] text-amber-800 font-bold block mb-1">मामांची माहिती (Maternal Uncle)</span>
                    <p className="font-semibold text-slate-800 text-xs">
                      {profile.uncleName} {profile.unclePlace ? `(${profile.unclePlace})` : ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Career & Education Tab */}
            {activeTab === 'career' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">शिक्षण (Education)</span>
                    <span className="font-bold text-slate-900 text-sm block">{profile.education}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">व्यवसाय / नोकरी (Occupation)</span>
                    <span className="font-bold text-slate-900 text-sm block">{profile.occupation}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">वार्षिक उत्पन्न (Annual Income)</span>
                    <span className="font-black text-emerald-700 text-base">{profile.income_label}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">सध्याचे शहर (Current City)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.currentCity}</span>
                  </div>
                </div>

                {profile.about && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-700 block mb-1">स्वतःबद्दल माहिती (About)</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{profile.about}</p>
                  </div>
                )}
              </div>
            )}

            {/* Personal Details Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">वर्ण (Complexion)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.complexion || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">रक्तगट (Blood Group)</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.bloodGroup || 'उपलब्ध नाही'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium block">वैवाहिक स्थिती</span>
                    <span className="font-bold text-slate-900 text-sm">{profile.maritalStatus || 'अविवाहित'}</span>
                  </div>
                  {profile.handicap && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] text-slate-500 font-medium block">अपंगत्व (Handicap)</span>
                      <span className="font-bold text-slate-900 text-sm">{profile.handicap}</span>
                    </div>
                  )}
                </div>

                {profile.expectations && (
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80">
                    <span className="text-xs font-bold text-rose-800 block mb-1">अपेक्षा (Expectations)</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{profile.expectations}</p>
                  </div>
                )}
              </div>
            )}

            {/* Documents & Scans Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {photos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(p)}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-zoom-in"
                      >
                        <img
                          src={p}
                          alt={`Document scan ${idx + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" /> झूम करा
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">कोणतेही स्कॅन केलेले दस्तऐवज उपलब्ध नाहीत.</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes & Tags Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                {/* Personal Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    खाजगी टीपा (Personal Notes)
                  </label>
                  <textarea
                    rows={4}
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="या स्थळाबद्दल महत्त्वाचे मुद्दे, फोनवरील संभाषण किंवा पालकांची मते येथे लिहून ठेवा..."
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">टीप आपोआप सेव्ह होते.</p>
                </div>

                {/* Custom Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    टॅग्ज (Custom Tags)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveTag(profile.nu_id, tag)}
                          className="hover:text-rose-900 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <form onSubmit={handleAddTagSubmit} className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="नवीन टॅग जोडा (उदा. 'पुणे स्थळ', 'IT Engineer')..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      जोडा
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => {
            setLightboxImage(null);
            setLightboxZoom(1);
          }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 select-none animate-in fade-in"
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
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="बंद करा (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image View */}
          <div
            className="flex-1 w-full max-w-4xl flex items-center justify-center relative overflow-hidden py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setCurrentPhotoIdx((prev) => {
                    const next = prev > 0 ? prev - 1 : photos.length - 1;
                    setLightboxImage(photos[next]);
                    return next;
                  });
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors z-20"
                title="मागील फोटो"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="max-h-[82vh] max-w-full overflow-auto flex items-center justify-center">
              <img
                src={lightboxImage}
                alt="Full size preview"
                style={{ transform: `scale(${lightboxZoom})`, transition: 'transform 0.15s ease-out' }}
                className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl cursor-grab"
              />
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setCurrentPhotoIdx((prev) => {
                    const next = prev < photos.length - 1 ? prev + 1 : 0;
                    setLightboxImage(photos[next]);
                    return next;
                  });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors z-20"
                title="पुढील फोटो"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Info */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10"
          >
            <span>कन्सोल: कीबोर्डवरील Left/Right बाण किंवा Esc दाबा</span>
            <span>ID: {profile.nu_id}</span>
          </div>
        </div>
      )}
    </div>
  );
};
