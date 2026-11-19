import React from 'react';
import { X, Sparkles, Star, XCircle, Trash2, MessageCircle, Phone } from 'lucide-react';
import { Profile, ProfileInteraction, TriageStatus } from '../types/profile';
import { getWhatsAppLink, getTelLink } from '../utils/formatters';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  interactions: Record<string, ProfileInteraction>;
  onRemoveFromCompare: (nu_id: string) => void;
  onClearCompare: () => void;
  onStatusChange: (nu_id: string, status: TriageStatus) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  profiles,
  interactions,
  onRemoveFromCompare,
  onClearCompare,
  onStatusChange
}) => {
  if (!isOpen || profiles.length === 0) return null;

  const rows: { label: string; render: (p: Profile, inter?: ProfileInteraction) => React.ReactNode }[] = [
    {
      label: 'Photo & Name',
      render: (p) => (
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 shadow-sm">
            {p.photos && p.photos.length > 0 ? (
              <img src={p.photos[0]} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-rose-50 text-rose-600 font-black flex items-center justify-center text-xl">
                {p.firstname?.[0] || 'L'}
              </div>
            )}
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{p.name}</h4>
          <span className="text-[11px] text-slate-400">ID: {p.nu_id}</span>
        </div>
      ),
    },
    {
      label: 'Decision',
      render: (p, inter) => {
        const status = inter?.status || 'default';
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onStatusChange(p.nu_id, status === 'shortlisted' ? 'default' : 'shortlisted')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                status === 'shortlisted' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-emerald-50'
              }`}
              title="Shortlist"
            >
              <Star className="w-4 h-4 fill-current" />
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
      render: (p) => (
        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
          {p.income_label}
        </span>
      ),
    },
    {
      label: 'Current City',
      render: (p) => <span className="font-medium text-slate-700">{p.currentCity}</span>,
    },
    {
      label: 'Native Place',
      render: (p) => (
        <div>
          <span className="font-medium text-slate-800 block">{p.nativePlace || 'N/A'}</span>
          <span className="text-xs text-slate-400">Dist: {p.nativeDistrict || 'N/A'}</span>
        </div>
      ),
    },
    {
      label: 'Family Details',
      render: (p) => (
        <div className="text-xs space-y-0.5">
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
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {call && (
              <a
                href={call}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Side-by-Side Comparison</h3>
              <p className="text-xs text-slate-500">Comparing {profiles.length} candidate profiles</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearCompare}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto overflow-y-auto flex-1 p-4 sm:p-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-left font-bold text-slate-500 uppercase tracking-wider w-32 sm:w-36 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                  Attribute
                </th>
                {profiles.map((p) => (
                  <th key={p.nu_id} className="p-3 text-center min-w-[200px] relative">
                    <button
                      onClick={() => onRemoveFromCompare(p.nu_id)}
                      className="absolute top-1 right-1 p-1 rounded-full text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/40' : ''}>
                  <td className="p-3 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">{row.label}</td>
                  {profiles.map((p) => (
                    <td key={p.nu_id} className="p-3 text-center align-middle">
                      {row.render(p, interactions[p.nu_id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
