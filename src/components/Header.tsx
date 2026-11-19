import React from 'react';
import { Search, Filter, Layers, Download, CheckSquare, Sparkles, X, Plus, BarChart3, Users } from 'lucide-react';
import { TriageStatus } from '../types/profile';

interface HeaderProps {
  activeSection: 'portal' | 'booklet' | 'kanban' | 'analytics' | 'groom_profile';
  onSectionChange: (sec: 'portal' | 'booklet' | 'kanban' | 'analytics' | 'groom_profile') => void;
  portalCount: number;
  bookletCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusTab: 'all' | TriageStatus;
  onStatusTabChange: (tab: 'all' | TriageStatus) => void;
  stats: {
    total: number;
    shortlisted: number;
    review: number;
    not_interested: number;
    contacted: number;
    unreviewed: number;
  };
  comparisonCount: number;
  onOpenComparison: () => void;
  onOpenExport: () => void;
  onOpenAddCandidate: () => void;
  onOpenFamilyShare: () => void;
  onToggleMobileFilters: () => void;
  viewMode: 'grid' | 'compact';
  onViewModeChange: (mode: 'grid' | 'compact') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onSectionChange,
  portalCount,
  bookletCount,
  searchQuery,
  onSearchChange,
  statusTab,
  onStatusTabChange,
  stats,
  comparisonCount,
  onOpenComparison,
  onOpenExport,
  onOpenAddCandidate,
  onOpenFamilyShare,
  onToggleMobileFilters,
  viewMode,
  onViewModeChange
}) => {
  const tabs: { id: 'all' | TriageStatus; label: string; count: number; color: string; icon?: string }[] = [
    { id: 'all', label: 'All Profiles', count: stats.total, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { id: 'shortlisted', label: 'Shortlisted', count: stats.shortlisted, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', icon: '⭐' },
    { id: 'review', label: 'Under Review', count: stats.review, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', icon: '⏳' },
    { id: 'contacted', label: 'Contacted', count: stats.contacted, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', icon: '📞' },
    { id: 'not_interested', label: 'Not Interested', count: stats.not_interested, color: 'bg-rose-50 text-rose-700 hover:bg-rose-100', icon: '❌' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main top bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink min-w-0">
            <img
              src="/icon.svg"
              alt="अनुबंध"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md shadow-rose-600/25 flex-shrink-0 object-contain"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight truncate">अनुबंध</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 flex-shrink-0">PWA</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium truncate">
                दोन मनांचे आणि दोन घराण्यांचे रेशीमबंध • <span className="text-slate-600 font-semibold">Created by Shubham Kharche</span>
              </p>
            </div>
          </div>

          {/* Desktop Search bar */}
          <div className="hidden sm:block flex-1 max-w-md mx-2 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, gotra, city, education, job..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-slate-100 border-none focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Mobile Filter toggle */}
            <button
              onClick={onToggleMobileFilters}
              className="lg:hidden flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200"
              title="Open Filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* View switcher */}
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('compact')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'compact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Compact List View"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>

            {/* Compare Button */}
            <button
              onClick={onOpenComparison}
              disabled={comparisonCount === 0}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all ${
                comparisonCount > 0
                  ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
              title="Compare Selected Profiles"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Compare</span>
              <span className="bg-purple-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                {comparisonCount}
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Export CSV / Backup Data"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Family Dossier & PDF Button */}
            <button
              onClick={onOpenFamilyShare}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 text-rose-800 border border-rose-200 transition-all shadow-xs"
              title="कौटुंबिक चर्चा पत्रिका तयार करा (A4 PDF / WhatsApp Share)"
            >
              <Users className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">कौटुंबिक पत्रिका</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input (full-width on mobile) */}
        <div className="sm:hidden pb-2 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, gotra, city, job..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 border-none focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-2 pt-2 pb-1.5 overflow-x-auto thin-scrollbar border-t border-slate-100">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onSectionChange('portal')}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'portal'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🌐 पोर्टल प्रोफाईल्स</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeSection === 'portal' ? 'bg-white/25 text-white' : 'bg-black/10 text-slate-700'
                }`}
              >
                {portalCount}
              </span>
            </button>

            <button
              onClick={() => onSectionChange('booklet')}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'booklet'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📖 मेळावा / पुस्तिका</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeSection === 'booklet' ? 'bg-white/25 text-white' : 'bg-black/10 text-slate-700'
                }`}
              >
                {bookletCount}
              </span>
            </button>

            <button
              onClick={() => onSectionChange('kanban')}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📋 पाईपलाईन (Kanban)</span>
            </button>

            <button
              onClick={() => onSectionChange('analytics')}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'analytics'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>📊 ॲनालिटिक्स</span>
            </button>

            <button
              onClick={() => onSectionChange('groom_profile')}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'groom_profile'
                  ? 'bg-rose-700 text-white shadow-sm shadow-rose-700/30 ring-2 ring-rose-300'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80 font-black'
              }`}
              title="चि. शुभम अनिल खर्चे यांचा विवाह बायोडाटा पहा"
            >
              <span>🤵 वर परिचय (शुभम खर्चे)</span>
            </button>
          </div>

          <button
            onClick={onOpenAddCandidate}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all whitespace-nowrap ml-auto"
            title="नवीन उमेदवार जोडा (Add New Candidate)"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">नवीन उमेदवार</span>
            <span className="sm:hidden">जोडा</span>
          </button>
        </div>

        {/* Status Filter Tab Pills */}
        {(activeSection === 'portal' || activeSection === 'booklet') && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 thin-scrollbar border-t border-slate-100">
            {tabs.map((tab) => {
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onStatusTabChange(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                      : tab.color
                  }`}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-current'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
