import React, { useState, useEffect, useMemo, useTransition } from 'react';
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
import { ProfileDetailPage } from './components/ProfileDetailPage';
import { BookletCard } from './components/BookletCard';
import { BookletDetailPage } from './components/BookletDetailPage';
import { BookletFilterSidebar, BookletFilterState } from './components/BookletFilterSidebar';
import { ComparisonPage } from './components/ComparisonPage';
import { ExportModal } from './components/ExportModal';
import { CandidateFormPage } from './components/CandidateFormPage';
import { KanbanBoard } from './components/KanbanBoard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FamilySharePage } from './components/FamilySharePage';
import { GroomProfilePage } from './components/GroomProfilePage';
import { InstallPwaModal } from './components/InstallPwaModal';
import { InstallFloatingBanner } from './components/InstallFloatingBanner';
import { Toast, ToastMessage } from './components/Toast';
import { PinLockScreen } from './components/PinLockScreen';
import { AdminLoginModal } from './components/AdminLoginModal';
import { isParentSessionValid, isAdminSessionValid, logoutParent, logoutAdmin } from './utils/auth';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export type PageView =
  | { type: 'portal' }
  | { type: 'booklet' }
  | { type: 'kanban' }
  | { type: 'analytics' }
  | { type: 'groom_profile' }
  | { type: 'profile_detail'; profile: Profile }
  | { type: 'booklet_detail'; candidate: BookletCandidate }
  | { type: 'comparison' }
  | { type: 'family_share'; candidate?: BookletCandidate | Profile | null }
  | { type: 'candidate_form'; candidateToEdit?: BookletCandidate | null };

export type SheetState =
  | { type: 'none' }
  | { type: 'admin_login'; reason?: string; pendingAction?: () => void }
  | { type: 'install_pwa' }
  | { type: 'export' };

export const App: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Transition hook for non-blocking responsive tab navigation
  const [, startTransition] = useTransition();

  // Security & Authentication States
  const [isParentAuth, setIsParentAuth] = useState<boolean>(() => isParentSessionValid());
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => isAdminSessionValid());

  // Page View and Navigation History Stack (Strictly 1 view rendered at a time)
  const [currentPageView, setCurrentPageView] = useState<PageView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/profile') || hash.includes('profile')) {
        return { type: 'groom_profile' };
      }
    }
    return { type: 'portal' };
  });

  const [navHistory, setNavHistory] = useState<PageView[]>([]);

  // Active Bottom Sheet (Strictly 1 bottomsheet active at a time)
  const [activeSheet, setActiveSheet] = useState<SheetState>({ type: 'none' });

  // Navigate to a new page (pushes current page to history stack, closes bottom sheet)
  const navigateTo = (view: PageView) => {
    setActiveSheet({ type: 'none' });
    setIsMobileFiltersOpen(false);

    setNavHistory((prev) => [...prev, currentPageView]);
    startTransition(() => {
      setCurrentPageView(view);
    });

    if (typeof window !== 'undefined') {
      if (view.type === 'groom_profile') {
        if (!window.location.pathname.includes('/profile')) {
          window.history.pushState({ page: 'groom_profile' }, '', '/profile');
        }
      } else {
        if (window.location.pathname.includes('/profile')) {
          window.history.pushState({ page: view.type }, '', '/');
        } else {
          window.history.pushState({ page: view.type }, '');
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Navigate back to previous page in history stack
  const navigateBack = () => {
    setActiveSheet({ type: 'none' });
    setIsMobileFiltersOpen(false);

    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory((h) => h.slice(0, -1));
      startTransition(() => {
        setCurrentPageView(prev);
      });
      if (typeof window !== 'undefined') {
        if (prev.type === 'groom_profile') {
          if (!window.location.pathname.includes('/profile')) {
            window.history.replaceState({ page: 'groom_profile' }, '', '/profile');
          }
        } else {
          if (window.location.pathname.includes('/profile')) {
            window.history.replaceState({ page: prev.type }, '', '/');
          }
        }
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      startTransition(() => {
        setCurrentPageView({ type: 'portal' });
      });
    }
  };

  // Browser hardware / popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/profile') || hash.includes('profile')) {
        setCurrentPageView({ type: 'groom_profile' });
        return;
      }
      if (navHistory.length > 0) {
        const prev = navHistory[navHistory.length - 1];
        setNavHistory((h) => h.slice(0, -1));
        setCurrentPageView(prev);
      } else {
        setCurrentPageView({ type: 'portal' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navHistory]);

  // Trigger Admin Password verification sheet if not yet authenticated
  const triggerAdminPrompt = (reason: string, onSuccessAction: () => void) => {
    if (isAdminAuth) {
      onSuccessAction();
    } else {
      setActiveSheet({
        type: 'admin_login',
        reason,
        pendingAction: onSuccessAction,
      });
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminAuth(false);
    setToast({
      id: String(Date.now()),
      message: 'ॲडमिन मोडमधून बाहेर पडलात.',
    });
    if (currentPageView.type === 'kanban' || currentPageView.type === 'analytics') {
      handleSectionChange('portal');
    }
  };

  const handleParentLogout = () => {
    logoutParent();
    logoutAdmin();
    setIsParentAuth(false);
    setIsAdminAuth(false);
    setToast({
      id: String(Date.now()),
      message: 'अनुबंध ॲप सुरक्षितपणे लॉक केले आहे.',
    });
  };

  const activeSection: 'portal' | 'booklet' | 'kanban' | 'analytics' | 'groom_profile' = useMemo(() => {
    switch (currentPageView.type) {
      case 'portal':
      case 'profile_detail':
      case 'comparison':
        return 'portal';
      case 'booklet':
      case 'booklet_detail':
      case 'candidate_form':
        return 'booklet';
      case 'kanban':
        return 'kanban';
      case 'analytics':
        return 'analytics';
      case 'groom_profile':
        return 'groom_profile';
      case 'family_share':
        return 'portal';
      default:
        return 'portal';
    }
  }, [currentPageView.type]);

  const handleSectionChange = (sec: 'portal' | 'booklet' | 'kanban' | 'analytics' | 'groom_profile') => {
    if ((sec === 'kanban' || sec === 'analytics') && !isAdminAuth) {
      triggerAdminPrompt(
        sec === 'kanban'
          ? 'मॅचमेकिंग पाईपलाईन (Kanban) पाहण्यासाठी ॲडमिन पासवर्ड आवश्यक आहे.'
          : 'ॲनालिटिक्स डॅशबोर्ड पाहण्यासाठी ॲडमिन पासवर्ड आवश्यक आहे.',
        () => {
          setNavHistory([]);
          startTransition(() => {
            setCurrentPageView({ type: sec });
            setCurrentPage(1);
          });
        }
      );
      return;
    }

    setNavHistory([]);
    startTransition(() => {
      setCurrentPageView({ type: sec });
      setCurrentPage(1);
    });

    if (typeof window !== 'undefined') {
      if (sec === 'groom_profile') {
        if (!window.location.pathname.includes('/profile')) {
          window.history.pushState(null, '', '/profile');
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        if (window.location.pathname.includes('/profile')) {
          window.history.pushState(null, '', '/');
        }
      }
    }
  };

  // PWA Install State & Handlers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if ((window as any).deferredInstallPrompt) {
      setDeferredPrompt((window as any).deferredInstallPrompt);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handlePromptReady = () => {
      if ((window as any).deferredInstallPrompt) {
        setDeferredPrompt((window as any).deferredInstallPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' && (window as any).deferredInstallPrompt);
    if (promptEvent) {
      promptEvent.prompt();
      try {
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
        }
      } catch {
        // Fallback
      }
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).deferredInstallPrompt = null;
      }
    } else {
      setActiveSheet({ type: 'install_pwa' });
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

  const comparedIdSet = useMemo(() => {
    return new Set(comparisonItems.map((c) => c.nu_id));
  }, [comparisonItems]);

  const comparedProfiles = useMemo(() => {
    return profiles.filter((p) => comparedIdSet.has(p.nu_id));
  }, [profiles, comparedIdSet]);

  const isBooklet = activeSection === 'booklet';

  // Filtering Portal Profiles
  const filteredPortalProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const inter = portalInteractionsMap[p.nu_id];
      const status = inter?.status || 'default';

      if (portalFilters.statusTab !== 'all') {
        if (portalFilters.statusTab === 'review') {
          if (status !== 'review') return false;
        } else if (status !== portalFilters.statusTab) {
          return false;
        }
      }

      if (p.age < portalFilters.minAge || p.age > portalFilters.maxAge) return false;
      if (p.income_num < portalFilters.minIncome || p.income_num > portalFilters.maxIncome) return false;

      if (portalFilters.hasPhotosOnly && (!p.photos || p.photos.length === 0)) return false;

      if (portalFilters.selectedGotras.length > 0 && !portalFilters.selectedGotras.includes(p.gotra)) return false;
      if (portalFilters.excludedGotras.length > 0 && portalFilters.excludedGotras.includes(p.gotra)) return false;

      if (portalFilters.selectedDistricts.length > 0 && (!p.nativeDistrict || !portalFilters.selectedDistricts.includes(p.nativeDistrict))) return false;
      if (portalFilters.selectedCities.length > 0 && (!p.currentCity || !portalFilters.selectedCities.includes(p.currentCity))) return false;

      if (portalFilters.selectedEducations.length > 0) {
        const matchesEdu = portalFilters.selectedEducations.some((edu) =>
          p.education.toLowerCase().includes(edu.toLowerCase())
        );
        if (!matchesEdu) return false;
      }

      if (portalFilters.maritalStatus !== 'all') {
        if (p.maritalStatus?.toLowerCase() !== portalFilters.maritalStatus.toLowerCase()) return false;
      }

      if (portalFilters.searchQuery.trim()) {
        const query = portalFilters.searchQuery.toLowerCase();
        const fullContent = `${p.name} ${p.gotra} ${p.currentCity} ${p.nativePlace} ${p.education} ${p.occupation} ${p.nu_id}`.toLowerCase();
        if (!fullContent.includes(query)) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (portalFilters.sortBy) {
        case 'age_asc': return a.age - b.age;
        case 'age_desc': return b.age - a.age;
        case 'income_desc': return b.income_num - a.income_num;
        case 'income_asc': return a.income_num - b.income_num;
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'updated_desc':
          return (portalInteractionsMap[b.nu_id]?.updatedAt || 0) - (portalInteractionsMap[a.nu_id]?.updatedAt || 0);
        default: return 0;
      }
    });
  }, [profiles, portalInteractionsMap, portalFilters]);

  // Filtering Booklet Candidates
  const filteredBookletCandidates = useMemo(() => {
    return bookletCandidates.filter((c) => {
      const inter = bookletInteractionsMap[c.id];
      const status = inter?.status || 'default';

      if (bookletFilters.statusTab !== 'all') {
        if (bookletFilters.statusTab === 'review') {
          if (status !== 'review') return false;
        } else if (status !== bookletFilters.statusTab) {
          return false;
        }
      }

      if (c.age < bookletFilters.minAge || c.age > bookletFilters.maxAge) return false;

      if (bookletFilters.selectedGotras.length > 0 && !bookletFilters.selectedGotras.includes(c.gotra)) return false;
      if (bookletFilters.excludedGotras.length > 0 && bookletFilters.excludedGotras.includes(c.gotra)) return false;

      if (bookletFilters.selectedMulgaons.length > 0 && !bookletFilters.selectedMulgaons.includes(c.mulgaon)) return false;

      if (bookletFilters.searchQuery.trim()) {
        const rawQ = bookletFilters.searchQuery.toLowerCase().trim();
        const asciiQ = marathiToAscii(rawQ);
        const nameAscii = marathiToAscii(c.name.toLowerCase());
        const rawContent = `${c.name} ${c.gotra} ${c.mulgaon} ${c.edu} ${c.contact} ${c.sr}`.toLowerCase();

        const matchesRaw = rawContent.includes(rawQ);
        const matchesAscii = nameAscii.includes(asciiQ) || c.id.toLowerCase().includes(rawQ);

        if (!matchesRaw && !matchesAscii) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (bookletFilters.sortBy) {
        case 'sr_asc': return (Number(a.sr) || 0) - (Number(b.sr) || 0);
        case 'sr_desc': return (Number(b.sr) || 0) - (Number(a.sr) || 0);
        case 'age_asc': return a.age - b.age;
        case 'age_desc': return b.age - a.age;
        case 'name_asc': return a.name.localeCompare(b.name, 'mr');
        default: return 0;
      }
    });
  }, [bookletCandidates, bookletInteractionsMap, bookletFilters]);

  // Stats calculation
  const portalStats = useMemo(() => {
    let shortlisted = 0;
    let review = 0;
    let not_interested = 0;
    let contacted = 0;

    for (const p of profiles) {
      const s = portalInteractionsMap[p.nu_id]?.status;
      if (s === 'shortlisted') shortlisted++;
      else if (s === 'review') review++;
      else if (s === 'not_interested') not_interested++;
      else if (s === 'contacted') contacted++;
    }

    const unreviewed = profiles.length - (shortlisted + review + not_interested + contacted);
    return { total: profiles.length, shortlisted, review, not_interested, contacted, unreviewed };
  }, [profiles, portalInteractionsMap]);

  const bookletStats = useMemo(() => {
    let shortlisted = 0;
    let review = 0;
    let not_interested = 0;
    let contacted = 0;

    for (const c of bookletCandidates) {
      const s = bookletInteractionsMap[c.id]?.status;
      if (s === 'shortlisted') shortlisted++;
      else if (s === 'review') review++;
      else if (s === 'not_interested') not_interested++;
      else if (s === 'contacted') contacted++;
    }

    const unreviewed = bookletCandidates.length - (shortlisted + review + not_interested + contacted);
    return { total: bookletCandidates.length, shortlisted, review, not_interested, contacted, unreviewed };
  }, [bookletCandidates, bookletInteractionsMap]);

  // Pagination calculations
  const currentTotalItems = isBooklet ? filteredBookletCandidates.length : filteredPortalProfiles.length;
  const totalPages = Math.ceil(currentTotalItems / ITEMS_PER_PAGE) || 1;

  const paginatedPortalProfiles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPortalProfiles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPortalProfiles, currentPage]);

  const paginatedBookletCandidates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookletCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookletCandidates, currentPage]);

  // Handlers
  const handlePortalStatusChange = async (nu_id: string, newStatus: TriageStatus) => {
    const prev = portalInteractionsMap[nu_id]?.status || 'default';
    await updateProfileStatus(nu_id, newStatus);

    const labels: Record<TriageStatus, string> = {
      shortlisted: '⭐ शॉर्टलिस्ट केले',
      not_interested: '❌ वगळले (Not Interested)',
      review: '⏳ विचाराधीन ठेवले (Review Later)',
      contacted: '📞 संपर्क साधला (Contacted)',
      default: 'पूर्वावत केले'
    };

    setToast({
      id: `${nu_id}_${Date.now()}`,
      message: `${labels[newStatus]}`,
      onUndo: async () => {
        await updateProfileStatus(nu_id, prev);
      }
    });
  };

  const handleBookletStatusChange = async (id: string, newStatus: TriageStatus) => {
    const prev = bookletInteractionsMap[id]?.status || 'default';
    await updateBookletStatus(id, newStatus);

    const labels: Record<TriageStatus, string> = {
      shortlisted: '⭐ शॉर्टलिस्ट केले',
      not_interested: '❌ वगळले (Pass)',
      review: '⏳ विचाराधीन ठेवले (Review)',
      contacted: '📞 संपर्क साधला (Called)',
      default: 'पूर्वावत केले'
    };

    setToast({
      id: `${id}_${Date.now()}`,
      message: `${labels[newStatus]}`,
      onUndo: async () => {
        await updateBookletStatus(id, prev);
      }
    });
  };

  const handleToggleCompare = async (nu_id: string) => {
    try {
      await toggleComparison(nu_id);
    } catch {
      setToast({
        id: String(Date.now()),
        message: 'जास्तीत जास्त ४ उमेदवारांची तुलना करता येते.'
      });
    }
  };

  const handleUpdatePipelineStage = async (id: string, stage: PipelineStage, isBookletCandidate: boolean) => {
    await updatePipelineStage(id, stage, isBookletCandidate);
  };

  const handleAddCallLog = async (
    id: string,
    note: string,
    stage: PipelineStage,
    contactPerson: string | undefined,
    isBookletCandidate: boolean
  ) => {
    await addCallLog(id, note, stage, contactPerson, isBookletCandidate);
    setToast({
      id: String(Date.now()),
      message: 'कॉल नोंद व पाइपलाइन टप्पा यशस्वीरित्या सेव्ह झाला!'
    });
  };

  const handleSaveCandidate = async (candidate: BookletCandidate) => {
    try {
      const exists = await db.booklet_candidates.get(candidate.id);
      if (exists) {
        await updateBookletCandidate(candidate);
        setToast({ id: String(Date.now()), message: `${candidate.name} ची माहिती यशस्वीरित्या अपडेट केली!` });
      } else {
        await addBookletCandidate(candidate);
        setToast({ id: String(Date.now()), message: `${candidate.name} यांना यशस्वीरित्या जोडले!` });
      }
    } catch (err: any) {
      setToast({ id: String(Date.now()), message: `त्रुटी: ${err.message}` });
    }
  };

  const handleImportBackup = async (importedInteractions: Record<string, ProfileInteraction>, section: 'portal' | 'booklet') => {
    try {
      const targetTable = section === 'booklet' ? db.booklet_interactions : db.interactions;
      for (const [id, interaction] of Object.entries(importedInteractions)) {
        await targetTable.put({
          ...interaction,
          nu_id: id,
          updatedAt: Date.now(),
        });
      }
      setToast({
        id: String(Date.now()),
        message: `${Object.keys(importedInteractions).length} नोंदी यशस्वीपणे रिस्टोअर झाल्या!`
      });
    } catch (err: any) {
      setToast({
        id: String(Date.now()),
        message: `बॅकअप रिस्टोअर अयशस्वी: ${err.message}`
      });
    }
  };

  // Full-screen Royal Loading Splash Screen
  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] flex flex-col items-center justify-between p-6 select-none relative overflow-hidden text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full pt-4 text-center">
          <p className="text-[11px] sm:text-xs tracking-[0.35em] uppercase text-amber-200/90 font-bold">
            ॥ श्री गणेशाय नमः ॥
          </p>
        </div>

        <div className="flex flex-col items-center text-center my-auto px-4 max-w-sm">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 shadow-2xl shadow-black/40 flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#881337] to-[#4c0519] flex items-center justify-center p-2.5">
                <img
                  src="/icon.svg"
                  alt="अनुबंध"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-amber-300/30 animate-ping -z-10" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif mb-2 drop-shadow-sm">
            अनुबंध
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/90 font-medium tracking-wide mb-6">
            दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध
          </p>

          <div className="w-56 h-1.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div className="h-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 rounded-full animate-pulse" />
          </div>

          <p className="text-xs text-rose-100/70 mt-3 font-semibold">
            स्थानिक डेटाबेस लोड होत आहे...
          </p>

          {dbError && (
            <div className="text-xs text-rose-200 bg-rose-950/80 border border-rose-500/40 p-3 rounded-2xl mt-4 max-w-xs">
              त्रुटी: {dbError}
            </div>
          )}
        </div>

        <div className="text-center pb-2">
          <p className="text-[11px] text-rose-200/50 font-medium">
            Created by Shubham Kharche
          </p>
        </div>
      </div>
    );
  }

  // Public Groom Profile Page (Accessible WITHOUT PIN, isolated from portal)
  if (currentPageView.type === 'groom_profile') {
    return (
      <div className="min-h-screen bg-[#eeeae5] selection:bg-rose-500 selection:text-white">
        <GroomProfilePage
          onBackToPortal={isParentAuth ? () => handleSectionChange('portal') : undefined}
          isParentAuthenticated={isParentAuth}
        />
        {/* Floating PWA Install Banner */}
        <InstallFloatingBanner
          onInstall={handleInstallClick}
          isStandalone={isStandalone}
        />
        {/* PWA Install Guide Bottom Sheet */}
        <InstallPwaModal
          isOpen={activeSheet.type === 'install_pwa'}
          onClose={() => setActiveSheet({ type: 'none' })}
          onNativeInstall={handleInstallClick}
          canNativeInstall={Boolean(deferredPrompt || (typeof window !== 'undefined' && (window as any).deferredInstallPrompt))}
        />
        {/* Toast */}
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Parent PIN Lock Screen (if 7-day session expired or not authenticated)
  if (!isParentAuth) {
    return (
      <div className="min-h-screen bg-slate-50 selection:bg-rose-500 selection:text-white">
        <PinLockScreen
          onUnlock={() => {
            setIsParentAuth(true);
            setToast({
              id: String(Date.now()),
              message: 'अनुबंध पोर्टलमध्ये स्वागत आहे!',
            });
          }}
          onOpenGroomProfile={() => handleSectionChange('groom_profile')}
        />
        {/* Floating PWA Install Banner */}
        <InstallFloatingBanner
          onInstall={handleInstallClick}
          isStandalone={isStandalone}
        />
        {/* PWA Install Guide Bottom Sheet */}
        <InstallPwaModal
          isOpen={activeSheet.type === 'install_pwa'}
          onClose={() => setActiveSheet({ type: 'none' })}
          onNativeInstall={handleInstallClick}
          canNativeInstall={Boolean(deferredPrompt || (typeof window !== 'undefined' && (window as any).deferredInstallPrompt))}
        />
        {/* Toast */}
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Dedicated Full-Page View 1: Candidate Deep-Dive (ProfileDetailPage)
  if (currentPageView.type === 'profile_detail') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-500 selection:text-white">
        <ProfileDetailPage
          profile={currentPageView.profile}
          interaction={portalInteractionsMap[currentPageView.profile.nu_id]}
          onBack={navigateBack}
          onStatusChange={handlePortalStatusChange}
          onRatingChange={(id, r) => updateProfileRating(id, r)}
          onNotesChange={(id, n) => updateProfileNotes(id, n)}
          onAddTag={(id, t) => addProfileTag(id, t)}
          onRemoveTag={(id, t) => removeProfileTag(id, t)}
          onToggleCompare={handleToggleCompare}
          isCompared={comparedIdSet.has(currentPageView.profile.nu_id)}
          onShareFamily={(p) => navigateTo({ type: 'family_share', candidate: p })}
        />
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Dedicated Full-Page View 2: Booklet Candidate Deep-Dive (BookletDetailPage)
  if (currentPageView.type === 'booklet_detail') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-500 selection:text-white">
        <BookletDetailPage
          candidate={currentPageView.candidate}
          interaction={bookletInteractionsMap[currentPageView.candidate.id]}
          onBack={navigateBack}
          onStatusChange={handleBookletStatusChange}
          onRatingChange={(id, r) => updateBookletRating(id, r)}
          onNotesChange={(id, n) => updateBookletNotes(id, n)}
          onAddTag={(id, t) => addBookletTag(id, t)}
          onRemoveTag={(id, t) => removeBookletTag(id, t)}
          onEdit={(cand) => {
            triggerAdminPrompt('उमेदवार माहिती संपादित करण्यासाठी ॲडमिन पासवर्ड आवश्यक आहे.', () => {
              navigateTo({ type: 'candidate_form', candidateToEdit: cand });
            });
          }}
          onShareFamily={(cand) => navigateTo({ type: 'family_share', candidate: cand })}
        />
        {/* Admin Login Bottom Sheet */}
        <AdminLoginModal
          isOpen={activeSheet.type === 'admin_login'}
          reasonMessage={activeSheet.type === 'admin_login' ? activeSheet.reason : undefined}
          onClose={() => setActiveSheet({ type: 'none' })}
          onLoginSuccess={() => {
            setIsAdminAuth(true);
            setToast({
              id: String(Date.now()),
              message: 'ॲडमिन प्रवेश यशस्वी झाला!',
            });
            if (activeSheet.type === 'admin_login' && activeSheet.pendingAction) {
              activeSheet.pendingAction();
            }
            setActiveSheet({ type: 'none' });
          }}
        />
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Dedicated Full-Page View 3: Side-by-Side Comparison (ComparisonPage)
  if (currentPageView.type === 'comparison') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-500 selection:text-white">
        <ComparisonPage
          profiles={comparedProfiles}
          interactions={portalInteractionsMap}
          onBack={navigateBack}
          onRemoveFromCompare={handleToggleCompare}
          onClearCompare={clearComparison}
          onStatusChange={handlePortalStatusChange}
          onSelectProfile={(p) => navigateTo({ type: 'profile_detail', profile: p })}
        />
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Dedicated Full-Page View 4: Family Share & Printable Dossier (FamilySharePage)
  if (currentPageView.type === 'family_share') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-500 selection:text-white">
        <FamilySharePage
          onBack={navigateBack}
          initialCandidate={currentPageView.candidate}
          portalProfiles={profiles}
          portalInteractions={portalInteractionsMap}
          bookletCandidates={bookletCandidates}
          bookletInteractions={bookletInteractionsMap}
          onShowToast={(msg) => setToast({ id: Date.now().toString(), message: msg })}
        />
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Dedicated Full-Page View 5: Candidate Add / Edit Form (CandidateFormPage)
  if (currentPageView.type === 'candidate_form') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-500 selection:text-white">
        <CandidateFormPage
          onBack={navigateBack}
          candidateToEdit={currentPageView.candidateToEdit}
          onSave={handleSaveCandidate}
        />
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
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
        onSectionChange={handleSectionChange}
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
        onOpenComparison={() => navigateTo({ type: 'comparison' })}
        onOpenExport={() => setActiveSheet({ type: 'export' })}
        onOpenAddCandidate={() => {
          triggerAdminPrompt('नवीन उमेदवार जोडण्यासाठी ॲडमिन पासवर्ड आवश्यक आहे.', () => {
            navigateTo({ type: 'candidate_form' });
          });
        }}
        onOpenFamilyShare={() => {
          navigateTo({ type: 'family_share' });
        }}
        onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isAdminAuthenticated={isAdminAuth}
        onAdminLoginRequest={(reason) => {
          triggerAdminPrompt(reason || 'ॲडमिन पासवर्ड आवश्यक आहे.', () => {});
        }}
        onAdminLogout={handleAdminLogout}
        onParentLogout={handleParentLogout}
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
              handleSectionChange(sec);
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
            onSelectPortal={(profile) => navigateTo({ type: 'profile_detail', profile })}
            onSelectBooklet={(candidate) => navigateTo({ type: 'booklet_detail', candidate })}
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
                      onSelect={() => navigateTo({ type: 'booklet_detail', candidate })}
                      onStatusChange={handleBookletStatusChange}
                      onRatingChange={(id, r) => updateBookletRating(id, r)}
                      onShareFamily={(cand) => navigateTo({ type: 'family_share', candidate: cand })}
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
                    onSelect={() => navigateTo({ type: 'profile_detail', profile })}
                    onStatusChange={handlePortalStatusChange}
                    onRatingChange={(id, r) => updateProfileRating(id, r)}
                    onToggleCompare={handleToggleCompare}
                    compact={viewMode === 'compact'}
                    onShareFamily={(p) => navigateTo({ type: 'family_share', candidate: p })}
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
            <img src="/icon.svg" alt="अनुबंध" className="w-5 h-5 rounded-md object-contain" />
            <span className="font-extrabold text-slate-800">अनुबंध</span>
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

      {/* Floating PWA Install Prompt Banner */}
      <InstallFloatingBanner
        onInstall={handleInstallClick}
        isStandalone={isStandalone}
      />

      {/* Export / Backup Bottom Sheet */}
      <ExportModal
        isOpen={activeSheet.type === 'export'}
        onClose={() => setActiveSheet({ type: 'none' })}
        activeSection={isBooklet ? 'booklet' : 'portal'}
        allProfiles={profiles}
        filteredProfiles={filteredPortalProfiles}
        interactions={portalInteractionsMap}
        bookletCandidates={bookletCandidates}
        filteredBookletCandidates={filteredBookletCandidates}
        bookletInteractions={bookletInteractionsMap}
        onImportBackup={handleImportBackup}
      />

      {/* PWA Install Guide Bottom Sheet */}
      <InstallPwaModal
        isOpen={activeSheet.type === 'install_pwa'}
        onClose={() => setActiveSheet({ type: 'none' })}
        onNativeInstall={handleInstallClick}
        canNativeInstall={Boolean(deferredPrompt || (typeof window !== 'undefined' && (window as any).deferredInstallPrompt))}
      />

      {/* Admin Login Bottom Sheet */}
      <AdminLoginModal
        isOpen={activeSheet.type === 'admin_login'}
        reasonMessage={activeSheet.type === 'admin_login' ? activeSheet.reason : undefined}
        onClose={() => setActiveSheet({ type: 'none' })}
        onLoginSuccess={() => {
          setIsAdminAuth(true);
          setToast({
            id: String(Date.now()),
            message: 'ॲडमिन प्रवेश यशस्वी झाला!',
          });
          if (activeSheet.type === 'admin_login' && activeSheet.pendingAction) {
            activeSheet.pendingAction();
          }
          setActiveSheet({ type: 'none' });
        }}
      />

      {/* Action Toast with Undo */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
