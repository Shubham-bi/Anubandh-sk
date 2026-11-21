import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles, Star, XCircle, Trash2, MessageCircle, Phone, X, Inbox } from 'lucide-react';
import { Profile, ProfileInteraction, TriageStatus } from '../types/profile';
import { getWhatsAppLink, getTelLink } from '../utils/formatters';

interface ComparisonPageProps {
  profiles: Profile[];
  interactions: Record<string, ProfileInteraction>;
  onBack: () => void;
  onRemoveFromCompare: (nu_id: string) => void;
  onClearCompare: () => void;
  onStatusChange: (nu_id: string, status: TriageStatus) => void;
  onSelectProfile?: (profile: Profile) => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  profiles,
  interactions,
  onBack,
  onRemoveFromCompare,
  onClearCompare,
  onStatusChange,
  onSelectProfile,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const rows: { label: string; render: (p: Profile, inter?: ProfileInteraction) => React.ReactNode }[] = [
    {
      label: 'Photo & Name',
      render: (p) => (
        <div className="flex flex-col items-center text-center p-2">
          <div
            onClick={() => onSelectProfile && onSelectProfile(p)}
            className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 shadow-sm ${
              onSelectProfile ? 'cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all' : ''
            }`}
          >
            {p.photos && p.photos.length > 0 ? (
              <img src={p.photos[0]} alt={p.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full bg-rose-50 text-rose-600 font-black flex items-center justify-center text-xl">
                {p.firstname?.[0] || 'L'}
              </div>
            )}
          </div>
          <h4
            onClick={() => onSelectProfile && onSelectProfile(p)}
            className={`font-extrabold text-sm text-slate-900 leading-tight ${
              onSelectProfile ? 'cursor-pointer hover:text-rose-600' : ''
            }`}
          >
            {p.name}
          </h4>
          <span className="text-[11px] text-slate-400">ID: {p.nu_id}</span>
        </div>
      ),
    },
    {
      label: 'Decision',
      render: (p, inter) => {
        const status = inter?.status || 'default';
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => onStatusChange(p.nu_id, status === 'shortlisted' ? 'default' : 'shortlisted')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                status === 'shortlisted' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-emerald-50'
              }`}
              title="Shortlist"
            >
              <Star className={`w-4 h-4 ${status === 'shortlisted' ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={() => onStatusChange(p.nu_id, status === 'not_interested' ? 'default' : 'not_interested')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                status === 'not_interested' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-rose-50'
              }`}
              title="Not Interested"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
    {
      label: 'Age & Height',
      render: (p) => (
        <div className="font-semibold text-slate-800">
          {p.age} yrs • {p.height}
        </div>
      ),
    },
    {
      label: 'Gotra & Mamkul',
      render: (p) => (
        <div>
          <span className="font-bold text-rose-600 block">{p.gotra}</span>
          <span className="text-slate-400 text-xs">Mamkul: {p.mamkul || 'N/A'}</span>
        </div>
      ),
    },
    {
      label: 'Education',
      render: (p) => <span className="font-semibold text-slate-800">{p.education}</span>,
    },
    {
      label: 'Occupation',
      render: (p) => <span className="text-slate-700">{p.occupation}</span>,
    },
    {
      label: 'Annual Income',
      render: (p) => <span className="font-bold text-emerald-700">{p.income_label}</span>,
    },
    {
      label: 'Current Location',
      render: (p) => <span className="text-slate-700">{p.currentCity}</span>,
    },
    {
      label: 'Native Place',
      render: (p) => (
        <span className="text-slate-700">
          {p.nativePlace ? `${p.nativePlace}, ` : ''}{p.nativeDistrict}
        </span>
      ),
    },
    {
      label: 'Birth Details',
      render: (p) => (
        <div className="text-xs sm:text-sm space-y-0.5">
          <p>{p.birthdate || 'N/A'} {p.birthtime ? `at ${p.birthtime}` : ''}</p>
          <p className="text-slate-400">{p.birthplace || 'N/A'}</p>
        </div>
      ),
    },
    {
      label: 'Kundali',
      render: (p) => (
        <div className="text-xs sm:text-sm space-y-0.5">
          <p><span className="text-slate-400">Rashi / Zodiac:</span> {p.zodiac || 'N/A'}</p>
          <p><span className="text-slate-400">Mangal:</span> {p.mangal || 'N/A'}</p>
        </div>
      ),
    },
    {
      label: 'Family Details',
      render: (p) => (
        <div className="text-xs sm:text-sm space-y-0.5">
          <p><span className="text-slate-400">Father:</span> {p.fatherOccupation || 'N/A'}</p>
          <p><span className="text-slate-400">Brothers:</span> {p.brothers}</p>
          <p><span className="text-slate-400">Sisters:</span> {p.sisters}</p>
        </div>
      ),
    },
    {
      label: 'Contact',
      render: (p) => {
        const wa = p.mobile1 ? getWhatsAppLink(p.mobile1, p.name) : null;
        const call = p.mobile1 ? getTelLink(p.mobile1) : null;
        return (
          <div className="flex items-center justify-center gap-1.5">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {call && (
              <a
                href={call}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>मागे (Back)</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700 hidden sm:block">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  तुलना तक्ता (Side-by-Side Comparison)
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profiles.length} स्थळांची तुलना
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profiles.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">सर्व काढा (Clear All)</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {profiles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">तुलनेसाठी कोणतेही स्थळ निवडलेले नाही</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              पोर्टलवरील प्रोफाईल कार्डवरील 'Compare' बटणावर क्लिक करून २ ते ४ स्थळे निवडा.
            </p>
            <button
              onClick={onBack}
              className="mt-5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
            >
              पोर्टलवर परत जा
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="p-3.5 text-left font-bold text-slate-500 uppercase tracking-wider w-36 sm:w-44 sticky left-0 bg-slate-50/95 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                      Attribute
                    </th>
                    {profiles.map((p) => (
                      <th key={p.nu_id} className="p-3.5 text-center min-w-[210px] relative">
                        <button
                          onClick={() => onRemoveFromCompare(p.nu_id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}>
                      <td className="p-3.5 font-bold text-slate-700 sticky left-0 bg-white/95 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        {row.label}
                      </td>
                      {profiles.map((p) => (
                        <td key={p.nu_id} className="p-3.5 text-center align-middle">
                          {row.render(p, interactions[p.nu_id])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
