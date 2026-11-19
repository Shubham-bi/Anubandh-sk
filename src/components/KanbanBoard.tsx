import React, { useState, useMemo } from 'react';
import {
  PIPELINE_STAGES,
  PipelineStage,
} from '../types/pipeline';
import { Profile, ProfileInteraction } from '../types/profile';
import { BookletCandidate, parseCandidateContacts } from '../types/candidate';
import { getProposalWhatsAppUrl } from '../utils/messages';
import {
  Phone,
  MessageCircle,
  Clock,
  PlusCircle,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BottomSheet } from './BottomSheet';

interface KanbanBoardProps {
  portalProfiles: Profile[];
  portalInteractions: Record<string, ProfileInteraction>;
  bookletCandidates: BookletCandidate[];
  bookletInteractions: Record<string, ProfileInteraction>;
  onUpdateStage: (id: string, stage: PipelineStage, isBooklet: boolean) => void;
  onAddCallLog: (
    id: string,
    note: string,
    stage: PipelineStage,
    contactPerson: string | undefined,
    isBooklet: boolean
  ) => void;
  onSelectPortal: (profile: Profile) => void;
  onSelectBooklet: (candidate: BookletCandidate) => void;
}

interface UnifiedItem {
  id: string;
  isBooklet: boolean;
  name: string;
  age: number;
  height: string;
  gotra: string;
  city: string;
  education: string;
  contactPerson: string;
  contactAddress: string;
  primaryPhone: string;
  stage: PipelineStage;
  logs: any[];
  interaction?: ProfileInteraction;
  rawPortal?: Profile;
  rawBooklet?: BookletCandidate;
}

export const KanbanBoardComponent: React.FC<KanbanBoardProps> = ({
  portalProfiles,
  portalInteractions,
  bookletCandidates,
  bookletInteractions,
  onUpdateStage,
  onAddCallLog,
  onSelectPortal,
  onSelectBooklet
}) => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'portal' | 'booklet'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Progressive rendering limit per column (prevents 30,000+ DOM nodes freezing the UI)
  const DEFAULT_COLUMN_LIMIT = 25;
  const [columnLimits, setColumnLimits] = useState<Record<string, number>>({});

  const getLimitForStage = (stageId: string) => columnLimits[stageId] || DEFAULT_COLUMN_LIMIT;

  const handleShowMore = (stageId: string) => {
    setColumnLimits((prev) => ({
      ...prev,
      [stageId]: (prev[stageId] || DEFAULT_COLUMN_LIMIT) + 30,
    }));
  };

  const handleShowAll = (stageId: string, total: number) => {
    setColumnLimits((prev) => ({
      ...prev,
      [stageId]: total,
    }));
  };

  // Call log dialog state
  const [activeLogItem, setActiveLogItem] = useState<UnifiedItem | null>(null);
  const [logNote, setLogNote] = useState('');
  const [logTargetStage, setLogTargetStage] = useState<PipelineStage>('contacted');

  // Build unified items
  const allItems: UnifiedItem[] = useMemo(() => {
    const list: UnifiedItem[] = [];

    // 1. Booklet candidates
    if (sourceFilter === 'all' || sourceFilter === 'booklet') {
      for (const b of bookletCandidates) {
        const inter = bookletInteractions[b.id];
        let stage: PipelineStage = inter?.stage || 'unreviewed';
        if (!inter?.stage) {
          if (inter?.status === 'shortlisted') stage = 'shortlisted';
          else if (inter?.status === 'review') stage = 'review';
          else if (inter?.status === 'contacted') stage = 'contacted';
          else if (inter?.status === 'not_interested') stage = 'passed';
        }

        const contacts = parseCandidateContacts(b.contact, b.phones);
        const pContact = contacts[0];

        list.push({
          id: b.id,
          isBooklet: true,
          name: b.name,
          age: b.age,
          height: b.height,
          gotra: b.gotra,
          city: b.mulgaon,
          education: b.edu?.split('\n')[0] || '',
          contactPerson: pContact?.name || '',
          contactAddress: pContact?.address || '',
          primaryPhone: pContact?.phoneClean || '',
          stage,
          logs: inter?.logs || [],
          interaction: inter,
          rawBooklet: b
        });
      }
    }

    // 2. Portal profiles
    if (sourceFilter === 'all' || sourceFilter === 'portal') {
      for (const p of portalProfiles) {
        const inter = portalInteractions[p.nu_id];
        let stage: PipelineStage = inter?.stage || 'unreviewed';
        if (!inter?.stage) {
          if (inter?.status === 'shortlisted') stage = 'shortlisted';
          else if (inter?.status === 'review') stage = 'review';
          else if (inter?.status === 'contacted') stage = 'contacted';
          else if (inter?.status === 'not_interested') stage = 'passed';
        }

        list.push({
          id: p.nu_id,
          isBooklet: false,
          name: p.name,
          age: p.age,
          height: p.height,
          gotra: p.gotra,
          city: p.currentCity,
          education: p.education,
          contactPerson: p.fatherName ? `${p.fatherName} (Father)` : '',
          contactAddress: p.nativePlace,
          primaryPhone: p.mobile1 || p.fatherMobile,
          stage,
          logs: inter?.logs || [],
          interaction: inter,
          rawPortal: p
        });
      }
    }

    return list;
  }, [
    portalProfiles,
    portalInteractions,
    bookletCandidates,
    bookletInteractions,
    sourceFilter
  ]);

  // Filtered by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.gotra.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.contactPerson.toLowerCase().includes(q) ||
        item.primaryPhone.includes(q) ||
        item.education.toLowerCase().includes(q)
    );
  }, [allItems, searchQuery]);

  // Group by stage
  const itemsByStage = useMemo(() => {
    const map: Record<PipelineStage, UnifiedItem[]> = {
      unreviewed: [],
      shortlisted: [],
      review: [],
      contacted: [],
      meeting: [],
      engaged: [],
      passed: []
    };
    for (const item of filteredItems) {
      if (map[item.stage]) {
        map[item.stage].push(item);
      } else {
        map.unreviewed.push(item);
      }
    }
    return map;
  }, [filteredItems]);

  const handleStageChange = (item: UnifiedItem, newStage: PipelineStage) => {
    onUpdateStage(item.id, newStage, item.isBooklet);
    if (newStage === 'engaged') {
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#e11d48', '#f59e0b', '#10b981', '#3b82f6']
        });
      } catch {
        // Ignore confetti failure in test or unsupported environments
      }
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLogItem || !logNote.trim()) return;

    onAddCallLog(
      activeLogItem.id,
      logNote.trim(),
      logTargetStage,
      activeLogItem.contactPerson,
      activeLogItem.isBooklet
    );

    setActiveLogItem(null);
    setLogNote('');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Source Filter Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setSourceFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              sourceFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            सर्व उमेदवार (All: {portalProfiles.length + bookletCandidates.length})
          </button>
          <button
            onClick={() => setSourceFilter('booklet')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              sourceFilter === 'booklet'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📖 पुस्तिका ({bookletCandidates.length})
          </button>
          <button
            onClick={() => setSourceFilter('portal')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              sourceFilter === 'portal'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🌐 पोर्टल ({portalProfiles.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="कानबानमध्ये नाव, गोत्र, गाव शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex items-start gap-4 overflow-x-auto pb-6 pt-1 thin-scrollbar">
        {PIPELINE_STAGES.map((stageDef) => {
          const items = itemsByStage[stageDef.id] || [];
          const limit = getLimitForStage(stageDef.id);
          const visibleItems = items.slice(0, limit);
          const hasMore = items.length > limit;

          return (
            <div
              key={stageDef.id}
              className={`w-72 sm:w-80 flex-shrink-0 rounded-2xl border ${stageDef.color} flex flex-col max-h-[80vh] overflow-hidden shadow-sm`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-base">{stageDef.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 tracking-tight">
                      {stageDef.titleMr}
                    </h3>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {stageDef.title}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${stageDef.badgeColor}`}>
                  {items.length}
                </span>
              </div>

              {/* Cards Stream */}
              <div className="p-2.5 overflow-y-auto space-y-3 flex-1">
                {visibleItems.length > 0 ? (
                  <>
                    {visibleItems.map((item) => {
                    const waLink = item.primaryPhone
                      ? getProposalWhatsAppUrl(item.primaryPhone.slice(-10), {
                          candidateName: item.name,
                          guardianName: item.contactPerson,
                          listNumber:
                            item.isBooklet && item.rawBooklet
                              ? item.rawBooklet.sr
                              : item.rawPortal
                              ? item.rawPortal.nu_id
                              : ''
                        })
                      : null;
                    const telLink = item.primaryPhone ? `tel:${item.primaryPhone}` : null;

                    return (
                      <div
                        key={item.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2.5 group relative"
                      >
                        {/* Top: Name & Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4
                              onClick={() => {
                                if (item.isBooklet && item.rawBooklet) onSelectBooklet(item.rawBooklet);
                                else if (item.rawPortal) onSelectPortal(item.rawPortal);
                              }}
                              className="font-bold text-sm text-slate-900 hover:text-rose-600 transition-colors truncate cursor-pointer"
                            >
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {item.age} वर्षे • {item.height} • <span className="font-semibold text-rose-600">{item.gotra}</span>
                            </p>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.isBooklet
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.isBooklet ? 'पुस्तिका' : 'पोर्टल'}
                          </span>
                        </div>

                        {/* Location & Career */}
                        <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="truncate">
                            <span className="text-slate-400">गाव:</span> {item.city}
                          </p>
                          {item.education && (
                            <p className="truncate font-medium">
                              <span className="text-slate-400">शिक्षण:</span> {item.education}
                            </p>
                          )}
                        </div>

                        {/* Contact Person Details */}
                        {item.contactPerson && (
                          <div className="text-[11px] text-slate-700 flex items-start gap-1.5">
                            <span className="font-semibold text-amber-700">पालक:</span>
                            <span className="truncate">{item.contactPerson}</span>
                          </div>
                        )}

                        {/* Phone & Direct Action Row */}
                        {item.primaryPhone && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <span className="font-mono font-bold text-slate-800">
                              📞 {item.primaryPhone.slice(-10)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {telLink && (
                                <a
                                  href={telLink}
                                  className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                  title="Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Call Logs snippet */}
                        {item.logs && item.logs.length > 0 && (
                          <div className="text-[10px] bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 space-y-1">
                            <span className="font-bold text-amber-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> शेवटची नोंद ({new Date(item.logs[0].timestamp).toLocaleDateString()}):
                            </span>
                            <p className="text-slate-700 line-clamp-2 italic">
                              "{item.logs[0].note}"
                            </p>
                          </div>
                        )}

                        {/* Card Footer: Add Log & Move Stage */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => {
                              setActiveLogItem(item);
                              setLogTargetStage(item.stage);
                            }}
                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>नोंद करा (Log)</span>
                          </button>

                          {/* Quick Stage Mover Selector */}
                          <select
                            value={item.stage}
                            onChange={(e) => handleStageChange(item, e.target.value as PipelineStage)}
                            className="text-[10px] font-bold py-1 px-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.icon} {s.titleMr}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {hasMore && (
                    <div className="pt-2 pb-1 text-center space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleShowMore(stageDef.id)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                      >
                        + आणखी ३० दाखवा ({visibleItems.length} / {items.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShowAll(stageDef.id, items.length)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline font-medium"
                      >
                        सर्व दाखवा ({items.length})
                      </button>
                    </div>
                  )}
                </>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs italic">
                    या टप्प्यात कोणीही नाही
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Call / Interaction Log Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(activeLogItem)}
        onClose={() => setActiveLogItem(null)}
        title="चर्चा / फोन नोंद (Call Discussion Log)"
        subtitle={activeLogItem ? `${activeLogItem.name} (${activeLogItem.city})` : ''}
        icon={<Phone className="w-5 h-5 text-rose-600" />}
        maxWidth="max-w-md"
      >
        {activeLogItem && (
          <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                नवीन टप्पा निवडा (Move Pipeline Stage)
              </label>
              <select
                value={logTargetStage}
                onChange={(e) => setLogTargetStage(e.target.value as PipelineStage)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.titleMr} ({s.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                झालेली चर्चा व महत्त्वाचे मुद्दे (Discussion Summary) *
              </label>
              <textarea
                rows={4}
                required
                placeholder="उदा. वडिलांशी बोलणे झाले. त्यांनी मुलगा पुण्यात असल्यास रविवारी भेटायला सांगितले..."
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveLogItem(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm"
              >
                नोंद जतन करा (Save Log)
              </button>
            </div>
          </form>
        )}
      </BottomSheet>
    </div>
  );
};

export const KanbanBoard = React.memo(KanbanBoardComponent);
