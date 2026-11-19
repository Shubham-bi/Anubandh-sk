import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  initDatabase,
  updateProfileStatus,
  updateProfileNotes,
  updateProfileRating,
  addProfileTag,
  removeProfileTag,
  updateBookletStatus,
  updateBookletNotes,
  updateBookletRating,
  addBookletTag,
  removeBookletTag,
  toggleComparison,
  clearComparison,
  addBookletCandidate,
  updateBookletCandidate,
  updatePipelineStage,
  addCallLog
} from './db';
import { Profile, ProfileInteraction, FilterState, TriageStatus } from './types/profile';
import { BookletCandidate, marathiToAscii } from './types/candidate';
import { PipelineStage } from './types/pipeline';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { ProfileCard } from './components/ProfileCard';
import { ProfileModal } from './components/ProfileModal';
import { BookletCard } from './components/BookletCard';
import { BookletModal } from './components/BookletModal';
import { BookletFilterSidebar, BookletFilterState } from './components/BookletFilterSidebar';
import { ComparisonModal } from './components/ComparisonModal';
import { ExportModal } from './components/ExportModal';
import { CandidateFormModal } from './components/CandidateFormModal';
import { KanbanBoard } from './components/KanbanBoard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FamilyShareModal } from './components/FamilyShareModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { InstallFloatingBanner } from './components/InstallFloatingBanner';
import { Toast, ToastMessage } from './components/Toast';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export const App: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Active section: 'portal' | 'booklet' | 'kanban' | 'analytics'
  const [activeSection, setActiveSection] = useState<'portal' | 'booklet' | 'kanban' | 'analytics'>('portal');

  // Candidate Add / Edit State
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<BookletCandidate | null>(null);

  // Family Share & Dossier State
  const [isFamilyShareOpen, setIsFamilyShareOpen] = useState(false);
  const [familyShareCandidate, setFamilyShareCandidate] = useState<BookletCandidate | Profile | null>(null);

  // PWA Install State & Handlers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
        }
      } catch {
        // Fallback
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Portal Filter State
  const [portalFilters, setPortalFilters] = useState<FilterState>({
    searchQuery: '',
    statusTab: 'all',
    minAge: 20,
    maxAge: 45,
    minIncome: 0,
    maxIncome: 10000000,
    selectedGotras: [],
    excludedGotras: [],
    selectedDistricts: [],
    selectedCities: [],
    selectedEducations: [],
    maritalStatus: 'all',
    hasPhotosOnly: false,
    sortBy: 'age_asc',
  });

  // Booklet Filter State
  const [bookletFilters, setBookletFilters] = useState<BookletFilterState>({
    searchQuery: '',
    statusTab: 'all',
    minAge: 20,
    maxAge: 35,
    selectedGotras: [],
    excludedGotras: [],
    selectedMulgaons: [],
    sortBy: 'sr_asc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Modals
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedBooklet, setSelectedBooklet] = useState<BookletCandidate | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Initialize DB
  useEffect(() => {
    initDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error('Failed to init IndexedDB:', err);
        setDbError(err.message);
      });
  }, []);

  // Live Queries from Dexie
  const profiles = useLiveQuery(() => db.profiles.toArray(), [], [] as Profile[]);
  const rawInteractions = useLiveQuery(() => db.interactions.toArray(), [], [] as ProfileInteraction[]);
  const bookletCandidates = useLiveQuery(() => db.booklet_candidates.toArray(), [], [] as BookletCandidate[]);
  const rawBookletInteractions = useLiveQuery(() => db.booklet_interactions.toArray(), [], [] as ProfileInteraction[]);
  const comparisonItems = useLiveQuery(() => db.comparison.toArray(), [], [] as { nu_id: string; addedAt: number }[]);

  // Maps for fast O(1) lookups
  const portalInteractionsMap = useMemo(() => {
    const map: Record<string, ProfileInteraction> = {};
    for (const item of rawInteractions) {
      map[item.nu_id] = item;
    }
    return map;
  }, [rawInteractions]);

  const bookletInteractionsMap = useMemo(() => {
    const map: Record<string, ProfileInteraction> = {};
    for (const item of rawBookletInteractions) {
      map[item.nu_id] = item;
    }
    return map;
  }, [rawBookletInteractions]);

  // Comparison
  const comparedIdSet = useMemo(() => new Set(comparisonItems.map((c) => c.nu_id)), [comparisonItems]);
  const comparedProfiles = useMemo(() => profiles.filter((p) => comparedIdSet.has(p.nu_id)), [profiles, comparedIdSet]);

  // Stats calculation
  const portalStats = useMemo(() => {
    let shortlisted = 0;
    let review = 0;
    let not_interested = 0;
    let contacted = 0;
    for (const inter of rawInteractions) {
      if (inter.status === 'shortlisted') shortlisted++;
      else if (inter.status === 'review') review++;
      else if (inter.status === 'not_interested') not_interested++;
      else if (inter.status === 'contacted') contacted++;
    }
    const reviewed = shortlisted + review + not_interested + contacted;
    return {
      total: profiles.length,
      shortlisted,
      review,
      not_interested,
      contacted,
      unreviewed: Math.max(0, profiles.length - reviewed),
    };
  }, [profiles.length, rawInteractions]);

  const bookletStats = useMemo(() => {
    let shortlisted = 0;
    let review = 0;
    let not_interested = 0;
    let contacted = 0;
    for (const inter of rawBookletInteractions) {
      if (inter.status === 'shortlisted') shortlisted++;
      else if (inter.status === 'review') review++;
      else if (inter.status === 'not_interested') not_interested++;
      else if (inter.status === 'contacted') contacted++;
    }
    const reviewed = shortlisted + review + not_interested + contacted;
    return {
      total: bookletCandidates.length,
      shortlisted,
      review,
      not_interested,
      contacted,
      unreviewed: Math.max(0, bookletCandidates.length - reviewed),
    };
  }, [bookletCandidates.length, rawBookletInteractions]);

  // Reset pagination when filters or section switch
  useEffect(() => {
    setCurrentPage(1);
  }, [portalFilters, bookletFilters, activeSection]);

  // Filter Portal Profiles
  const filteredPortalProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];
    const query = portalFilters.searchQuery.trim().toLowerCase();

    return profiles
      .filter((p) => {
        const status = portalInteractionsMap[p.nu_id]?.status || 'default';
        if (portalFilters.statusTab !== 'all' && status !== portalFilters.statusTab) return false;

        if (query) {
          const inter = portalInteractionsMap[p.nu_id];
          const match =
            p.name.toLowerCase().includes(query) ||
            p.gotra.toLowerCase().includes(query) ||
            p.mamkul.toLowerCase().includes(query) ||
            p.education.toLowerCase().includes(query) ||
            p.occupation.toLowerCase().includes(query) ||
            p.currentCity.toLowerCase().includes(query) ||
            p.nativeDistrict.toLowerCase().includes(query) ||
            p.nativePlace.toLowerCase().includes(query) ||
            p.nu_id.includes(query) ||
            (inter?.notes && inter.notes.toLowerCase().includes(query)) ||
            (inter?.tags && inter.tags.some((t) => t.toLowerCase().includes(query)));
          if (!match) return false;
        }

        if (p.age < portalFilters.minAge || p.age > portalFilters.maxAge) return false;
        if (portalFilters.minIncome > 0 && p.income_num < portalFilters.minIncome) return false;

        if (portalFilters.selectedGotras.length > 0 && !portalFilters.selectedGotras.includes(p.gotra)) return false;
        if (portalFilters.excludedGotras.length > 0 && portalFilters.excludedGotras.includes(p.gotra)) return false;

        if (portalFilters.selectedDistricts.length > 0 && !portalFilters.selectedDistricts.includes(p.nativeDistrict)) return false;
        if (portalFilters.selectedCities.length > 0 && !portalFilters.selectedCities.includes(p.currentCity)) return false;
        if (portalFilters.selectedEducations.length > 0 && !portalFilters.selectedEducations.includes(p.education)) return false;
        if (portalFilters.hasPhotosOnly && (!p.photos || p.photos.length === 0)) return false;

        return true;
      })
      .sort((a, b) => {
        switch (portalFilters.sortBy) {
          case 'age_asc':
            return a.age - b.age;
          case 'age_desc':
            return b.age - a.age;
          case 'income_desc':
            return b.income_num - a.income_num;
          case 'income_asc':
            return a.income_num - b.income_num;
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'updated_desc': {
            const timeA = portalInteractionsMap[a.nu_id]?.updatedAt || 0;
            const timeB = portalInteractionsMap[b.nu_id]?.updatedAt || 0;
            return timeB - timeA;
          }
          default:
            return 0;
        }
      });
  }, [profiles, portalFilters, portalInteractionsMap]);

  // Filter Booklet Candidates
  const filteredBookletCandidates = useMemo(() => {
    if (!bookletCandidates || bookletCandidates.length === 0) return [];
    const query = bookletFilters.searchQuery.trim().toLowerCase();
    const queryAscii = marathiToAscii(query);

    return bookletCandidates
      .filter((c) => {
        const status = bookletInteractionsMap[c.id]?.status || 'default';
        if (bookletFilters.statusTab !== 'all' && status !== bookletFilters.statusTab) return false;

        if (query) {
          const inter = bookletInteractionsMap[c.id];
          const textCorpus = `${c.name} ${c.gotra} ${c.mamkul} ${c.mulgaon} ${c.edu} ${c.fam} ${c.contact} ${c.sr} ${(c.phones || []).join(' ')}`.toLowerCase();
          const match =
            textCorpus.includes(query) ||
            marathiToAscii(textCorpus).includes(queryAscii) ||
            (inter?.notes && inter.notes.toLowerCase().includes(query)) ||
            (inter?.tags && inter.tags.some((t) => t.toLowerCase().includes(query)));
          if (!match) return false;
        }

        if (c.age < bookletFilters.minAge || c.age > bookletFilters.maxAge) return false;

        if (bookletFilters.selectedGotras.length > 0 && !bookletFilters.selectedGotras.includes(c.gotra)) return false;
        if (bookletFilters.excludedGotras.length > 0 && bookletFilters.excludedGotras.includes(c.gotra)) return false;

        if (bookletFilters.selectedMulgaons.length > 0 && !bookletFilters.selectedMulgaons.includes(c.mulgaon)) return false;

        return true;
      })
      .sort((a, b) => {
        const getSrNum = (cand: BookletCandidate) => {
          const digits = marathiToAscii(cand.sr || '').replace(/[^\d]/g, '');
          const n = parseInt(digits, 10);
          return isNaN(n) ? 999999 : n;
        };

        switch (bookletFilters.sortBy) {
          case 'sr_asc': {
            const numA = getSrNum(a);
            const numB = getSrNum(b);
            return numA - numB;
          }
          case 'sr_desc': {
            const numA = getSrNum(a);
            const numB = getSrNum(b);
            return numB - numA;
          }
          case 'age_asc':
            return a.age - b.age;
          case 'age_desc':
            return b.age - a.age;
          case 'name_asc':
            return a.name.localeCompare(b.name, 'mr');
          default:
            return 0;
        }
      });
  }, [bookletCandidates, bookletFilters, bookletInteractionsMap]);

  // Pagination
  const isBooklet = activeSection === 'booklet';
  const currentTotalItems = isBooklet ? filteredBookletCandidates.length : filteredPortalProfiles.length;
  const totalPages = Math.ceil(currentTotalItems / ITEMS_PER_PAGE);

  const paginatedPortalProfiles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPortalProfiles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPortalProfiles, currentPage]);

  const paginatedBookletCandidates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookletCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookletCandidates, currentPage]);

  // Handlers for Portal triage
  const handlePortalStatusChange = async (nu_id: string, newStatus: TriageStatus) => {
    const prevStatus = portalInteractionsMap[nu_id]?.status || 'default';
    const profile = profiles.find((p) => p.nu_id === nu_id);
    await updateProfileStatus(nu_id, newStatus);

    const labels: Record<TriageStatus, string> = {
      default: 'Reset to Unreviewed',
      shortlisted: '⭐ Shortlisted',
      review: '⏳ Under Review',
      contacted: '📞 Contacted',
      not_interested: '❌ Pass',
    };

    setToast({
      id: String(Date.now()),
      message: `${labels[newStatus]}: ${profile?.name || 'Profile'}`,
      onUndo: async () => {
        await updateProfileStatus(nu_id, prevStatus);
      },
    });
  };

  // Handlers for Booklet triage
  const handleBookletStatusChange = async (id: string, newStatus: TriageStatus) => {
    const prevStatus = bookletInteractionsMap[id]?.status || 'default';
    const candidate = bookletCandidates.find((c) => c.id === id);
    await updateBookletStatus(id, newStatus);

    const labels: Record<TriageStatus, string> = {
      default: 'रीसेट केले',
      shortlisted: '⭐ शॉर्टलिस्ट केले',
      review: '⏳ रिव्ह्यू (विचारार्थ)',
      contacted: '📞 संपर्क केला',
      not_interested: '❌ वगळले (Pass)',
    };

    setToast({
      id: String(Date.now()),
      message: `${labels[newStatus]}: ${candidate?.name || 'उमेदवार'}`,
      onUndo: async () => {
        await updateBookletStatus(id, prevStatus);
      },
    });
  };

  const handleToggleCompare = async (nu_id: string) => {
    try {
      await toggleComparison(nu_id);
    } catch (err: any) {
      setToast({
        id: String(Date.now()),
        message: err.message,
      });
    }
  };

  // Handlers for Candidate CRUD & Kanban Pipeline
  const handleSaveCandidate = async (candidate: BookletCandidate) => {
    try {
      const isExisting = bookletCandidates.some((c) => c.id === candidate.id);
      if (isExisting) {
        await updateBookletCandidate(candidate);
        setToast({
          id: String(Date.now()),
          message: `बदल सेव्ह झाले: ${candidate.name}`,
        });
      } else {
        await addBookletCandidate(candidate);
        setToast({
          id: String(Date.now()),
          message: `नवीन उमेदवार जोडला: ${candidate.name}`,
        });
      }
      setIsAddCandidateOpen(false);
      setCandidateToEdit(null);
    } catch (err: any) {
      console.error('Failed to save candidate:', err);
      setToast({
        id: String(Date.now()),
        message: err.message || 'उमेदवार सेव्ह करता आला नाही.',
      });
    }
  };

  const handleUpdatePipelineStage = async (id: string, stage: PipelineStage, isBooklet: boolean) => {
    try {
      await updatePipelineStage(id, stage, isBooklet);
      setToast({
        id: String(Date.now()),
        message: `पाईपलाईन स्टेज अद्ययावत केले.`,
      });
    } catch (err: any) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleAddCallLog = async (
    id: string,
    note: string,
    stage: PipelineStage,
    contactPerson: string | undefined,
    isBooklet: boolean
  ) => {
    try {
      await addCallLog(id, note, stage, contactPerson, isBooklet);
      setToast({
        id: String(Date.now()),
        message: 'कॉल नोंद यशस्वीरित्या जोडली.',
      });
    } catch (err: any) {
      console.error('Failed to add call log:', err);
    }
  };

  const handleImportBackup = async (imported: Record<string, ProfileInteraction>, section: 'portal' | 'booklet') => {
    const items = Object.values(imported);
    if (section === 'booklet') {
      await db.booklet_interactions.bulkPut(items);
    } else {
      await db.interactions.bulkPut(items);
    }
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <img
          src="/icon.svg"
          alt="Anubandh अनुबंध"
          className="w-16 h-16 rounded-2xl animate-pulse shadow-lg shadow-rose-600/30 mb-4 object-contain"
        />
        <h2 className="text-xl font-black text-slate-800">Anubandh अनुबंध</h2>
        <p className="text-xs font-semibold text-rose-600 mt-1">दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध</p>
        <p className="text-[11px] text-slate-400 font-medium mt-1">Created by Shubham Kharche</p>
        {dbError && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg mt-3">
            Error: {dbError}
          </p>
        )}
      </div>
    );
  }

  const activeStats = isBooklet ? bookletStats : portalStats;
  const activeStatusTab = isBooklet ? bookletFilters.statusTab : portalFilters.statusTab;
  const activeSearchQuery = isBooklet ? bookletFilters.searchQuery : portalFilters.searchQuery;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <Header
        activeSection={activeSection}
        onSectionChange={(sec) => {
          setActiveSection(sec);
          setCurrentPage(1);
        }}
        portalCount={profiles.length}
        bookletCount={bookletCandidates.length}
        searchQuery={activeSearchQuery}
        onSearchChange={(q) => {
          if (isBooklet) {
            setBookletFilters((prev) => ({ ...prev, searchQuery: q }));
          } else {
            setPortalFilters((prev) => ({ ...prev, searchQuery: q }));
          }
        }}
        statusTab={activeStatusTab}
        onStatusTabChange={(tab) => {
          if (isBooklet) {
            setBookletFilters((prev) => ({ ...prev, statusTab: tab }));
          } else {
            setPortalFilters((prev) => ({ ...prev, statusTab: tab }));
          }
        }}
        stats={activeStats}
        comparisonCount={comparisonItems.length}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAddCandidate={() => {
          setCandidateToEdit(null);
          setIsAddCandidateOpen(true);
        }}
        onOpenFamilyShare={() => {
          setFamilyShareCandidate(null);
          setIsFamilyShareOpen(true);
        }}
        onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Body */}
      {activeSection === 'analytics' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnalyticsDashboard
            portalProfiles={profiles}
            portalInteractions={portalInteractionsMap}
            bookletCandidates={bookletCandidates}
            bookletInteractions={bookletInteractionsMap}
            onNavigateToSection={(sec) => {
              setActiveSection(sec);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : activeSection === 'kanban' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
          <KanbanBoard
            portalProfiles={profiles}
            portalInteractions={portalInteractionsMap}
            bookletCandidates={bookletCandidates}
            bookletInteractions={bookletInteractionsMap}
            onUpdateStage={handleUpdatePipelineStage}
            onAddCallLog={handleAddCallLog}
            onSelectPortal={(profile) => setSelectedProfile(profile)}
            onSelectBooklet={(candidate) => setSelectedBooklet(candidate)}
          />
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-start gap-4 sm:gap-6 min-w-0">
          {/* Sidebar depending on activeSection */}
          {isBooklet ? (
            <BookletFilterSidebar
              filters={bookletFilters}
              onFilterChange={setBookletFilters}
              candidates={bookletCandidates}
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
              filteredCount={filteredBookletCandidates.length}
              totalCount={bookletCandidates.length}
            />
          ) : (
            <FilterSidebar
              filters={portalFilters}
              onFilterChange={setPortalFilters}
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
              filteredCount={filteredPortalProfiles.length}
              totalCount={profiles.length}
            />
          )}

          {/* Content Stream */}
          <main className="flex-1 min-w-0">
            {/* Stream stats banner */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {currentTotalItems} {isBooklet ? 'उमेदवार सापडले' : 'Profiles Found'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {isBooklet ? '📖 मेळावा पुस्तिका' : '🌐 ऑनलाइन पोर्टल'}
                </span>
              </div>

              {totalPages > 1 && (
                <span className="text-xs text-slate-500 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {/* Render Candidate / Profile Cards */}
            {isBooklet ? (
              paginatedBookletCandidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedBookletCandidates.map((candidate) => (
                    <BookletCard
                      key={candidate.id}
                      candidate={candidate}
                      interaction={bookletInteractionsMap[candidate.id]}
                      onSelect={() => setSelectedBooklet(candidate)}
                      onStatusChange={handleBookletStatusChange}
                      onRatingChange={(id, r) => updateBookletRating(id, r)}
                      onShareFamily={(cand) => {
                        setFamilyShareCandidate(cand);
                        setIsFamilyShareOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                    <Inbox className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">कोणतेही उमेदवार सापडले नाहीत</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    वय किंवा गोत्र फिल्टर्स तपासा, किंवा सर्च शब्द बदला.
                  </p>
                  <button
                    onClick={() =>
                      setBookletFilters({
                        searchQuery: '',
                        statusTab: 'all',
                        minAge: 20,
                        maxAge: 35,
                        selectedGotras: [],
                        excludedGotras: [],
                        selectedMulgaons: [],
                        sortBy: 'sr_asc',
                      })
                    }
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                  >
                    फिल्टर्स रीसेट करा
                  </button>
                </div>
              )
            ) : paginatedPortalProfiles.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'space-y-3'
                }
              >
                {paginatedPortalProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.nu_id}
                    profile={profile}
                    interaction={portalInteractionsMap[profile.nu_id]}
                    isCompared={comparedIdSet.has(profile.nu_id)}
                    onSelect={() => setSelectedProfile(profile)}
                    onStatusChange={handlePortalStatusChange}
                    onRatingChange={(id, r) => updateProfileRating(id, r)}
                    onToggleCompare={handleToggleCompare}
                    compact={viewMode === 'compact'}
                    onShareFamily={(p) => {
                      setFamilyShareCandidate(p);
                      setIsFamilyShareOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No matching profiles found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try widening your age, income, or gotra filters, or clear your search terms.
                </p>
                <button
                  onClick={() =>
                    setPortalFilters({
                      searchQuery: '',
                      statusTab: 'all',
                      minAge: 20,
                      maxAge: 45,
                      minIncome: 0,
                      maxIncome: 10000000,
                      selectedGotras: [],
                      excludedGotras: [],
                      selectedDistricts: [],
                      selectedCities: [],
                      selectedEducations: [],
                      maritalStatus: 'all',
                      hasPhotosOnly: false,
                      sortBy: 'age_asc',
                    })
                  }
                  className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-none">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && pageNum - prev > 1;
                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span className="text-slate-300 px-1 text-xs">…</span>}
                          <button
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                              currentPage === pageNum
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {/* App Footer with Creator Attribution */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-4 sm:py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Anubandh अनुबंध" className="w-5 h-5 rounded-md object-contain" />
            <span className="font-extrabold text-slate-800">Anubandh अनुबंध</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <span>Created by</span>
            <span className="font-black text-rose-600">Shubham Kharche</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">निर्मिती: शुभम खर्चे</span>
          </div>
        </div>
      </footer>

      {/* Portal Profile Deep-Dive Modal */}
      <ProfileModal
        profile={selectedProfile}
        interaction={selectedProfile ? portalInteractionsMap[selectedProfile.nu_id] : undefined}
        isOpen={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
        onStatusChange={handlePortalStatusChange}
        onRatingChange={(id, r) => updateProfileRating(id, r)}
        onNotesChange={(id, n) => updateProfileNotes(id, n)}
        onAddTag={(id, t) => addProfileTag(id, t)}
        onRemoveTag={(id, t) => removeProfileTag(id, t)}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedProfile ? comparedIdSet.has(selectedProfile.nu_id) : false}
        onShareFamily={(p) => {
          setFamilyShareCandidate(p);
          setIsFamilyShareOpen(true);
        }}
      />

      {/* Booklet Candidate Deep-Dive Modal */}
      <BookletModal
        candidate={selectedBooklet}
        interaction={selectedBooklet ? bookletInteractionsMap[selectedBooklet.id] : undefined}
        isOpen={Boolean(selectedBooklet)}
        onClose={() => setSelectedBooklet(null)}
        onStatusChange={handleBookletStatusChange}
        onRatingChange={(id, r) => updateBookletRating(id, r)}
        onNotesChange={(id, n) => updateBookletNotes(id, n)}
        onAddTag={(id, t) => addBookletTag(id, t)}
        onRemoveTag={(id, t) => removeBookletTag(id, t)}
        onEdit={(cand) => {
          setCandidateToEdit(cand);
          setIsAddCandidateOpen(true);
        }}
        onShareFamily={(cand) => {
          setFamilyShareCandidate(cand);
          setIsFamilyShareOpen(true);
        }}
      />

      {/* Side-by-Side Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        profiles={comparedProfiles}
        interactions={portalInteractionsMap}
        onRemoveFromCompare={handleToggleCompare}
        onClearCompare={clearComparison}
        onStatusChange={handlePortalStatusChange}
      />

      {/* Export / Backup Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeSection={activeSection === 'portal' ? 'portal' : 'booklet'}
        allProfiles={profiles}
        filteredProfiles={filteredPortalProfiles}
        interactions={portalInteractionsMap}
        bookletCandidates={bookletCandidates}
        filteredBookletCandidates={filteredBookletCandidates}
        bookletInteractions={bookletInteractionsMap}
        onImportBackup={handleImportBackup}
      />

      {/* Candidate Add / Edit Modal */}
      <CandidateFormModal
        isOpen={isAddCandidateOpen}
        onClose={() => {
          setIsAddCandidateOpen(false);
          setCandidateToEdit(null);
        }}
        candidateToEdit={candidateToEdit}
        onSave={handleSaveCandidate}
      />

      {/* Family Discussion Dossier & PDF Share Modal */}
      <FamilyShareModal
        isOpen={isFamilyShareOpen}
        onClose={() => {
          setIsFamilyShareOpen(false);
          setFamilyShareCandidate(null);
        }}
        initialCandidate={familyShareCandidate}
        portalProfiles={profiles}
        portalInteractions={portalInteractionsMap}
        bookletCandidates={bookletCandidates}
        bookletInteractions={bookletInteractionsMap}
        onShowToast={(msg) => setToast({ id: Date.now().toString(), message: msg })}
      />

      {/* Floating PWA Install Prompt Banner */}
      <InstallFloatingBanner
        onInstall={handleInstallClick}
        isStandalone={isStandalone}
      />

      {/* PWA Install Guide Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onNativeInstall={handleInstallClick}
        canNativeInstall={Boolean(deferredPrompt)}
      />

      {/* Action Toast with Undo */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
