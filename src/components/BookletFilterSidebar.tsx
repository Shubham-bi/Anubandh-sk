import React, { useState, useMemo } from 'react';
import { Filter, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { BookletCandidate } from '../types/candidate';
import { TriageStatus } from '../types/profile';

export interface BookletFilterState {
  searchQuery: string;
  statusTab: 'all' | TriageStatus;
  minAge: number;
  maxAge: number;
  selectedGotras: string[];
  excludedGotras: string[];
  selectedMulgaons: string[];
  sortBy: 'age_asc' | 'age_desc' | 'name_asc';
}

interface BookletFilterSidebarProps {
  filters: BookletFilterState;
  onFilterChange: (f: BookletFilterState) => void;
  candidates: BookletCandidate[];
  isOpen: boolean;
  onClose: () => void;
  filteredCount: number;
  totalCount: number;
}

export const BookletFilterSidebar: React.FC<BookletFilterSidebarProps> = ({
  filters,
  onFilterChange,
  candidates,
  isOpen,
  onClose,
  filteredCount,
  totalCount
}) => {
  const [gotraSearch, setGotraSearch] = useState('');
  const [mulgaonSearch, setMulgaonSearch] = useState('');
  const [gotraMode, setGotraMode] = useState<'include' | 'exclude'>('include');

  const [expandedSections, setExpandedSections] = useState({
    age: true,
    gotra: true,
    mulgaon: true,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allGotras = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach((c) => {
      if (c.gotra) s.add(c.gotra.trim());
    });
    return Array.from(s).sort();
  }, [candidates]);

  const allMulgaons = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach((c) => {
      if (c.mulgaon) s.add(c.mulgaon.trim());
    });
    return Array.from(s).sort();
  }, [candidates]);

  const filteredGotras = allGotras.filter((g) =>
    g.toLowerCase().includes(gotraSearch.toLowerCase())
  );

  const filteredMulgaons = allMulgaons.filter((m) =>
    m.toLowerCase().includes(mulgaonSearch.toLowerCase())
  );

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      statusTab: 'all',
      minAge: 20,
      maxAge: 35,
      selectedGotras: [],
      excludedGotras: [],
      selectedMulgaons: [],
      sortBy: 'age_asc',
    });
  };

  const toggleGotra = (gotra: string) => {
    if (gotraMode === 'include') {
      const exists = filters.selectedGotras.includes(gotra);
      const next = exists
        ? filters.selectedGotras.filter((g) => g !== gotra)
        : [...filters.selectedGotras, gotra];
      onFilterChange({ ...filters, selectedGotras: next });
    } else {
      const exists = filters.excludedGotras.includes(gotra);
      const next = exists
        ? filters.excludedGotras.filter((g) => g !== gotra)
        : [...filters.excludedGotras, gotra];
      onFilterChange({ ...filters, excludedGotras: next });
    }
  };

  const toggleMulgaon = (mulgaon: string) => {
    const exists = filters.selectedMulgaons.includes(mulgaon);
    const next = exists
      ? filters.selectedMulgaons.filter((m) => m !== mulgaon)
      : [...filters.selectedMulgaons, mulgaon];
    onFilterChange({ ...filters, selectedMulgaons: next });
  };

  const hasActiveFilters =
    filters.minAge > 20 ||
    filters.maxAge < 35 ||
    filters.selectedGotras.length > 0 ||
    filters.excludedGotras.length > 0 ||
    filters.selectedMulgaons.length > 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[85vw] max-w-sm sm:w-80 bg-white border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)] lg:z-10 lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-600" />
            <h2 className="font-bold text-sm text-slate-900">फिल्टर्स (Filters)</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredCount} / {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50"
              >
                <RotateCcw className="w-3 h-3" /> रीसेट
              </button>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5 text-sm divide-y divide-slate-100">
          {/* Age Filter */}
          <div className="pt-2">
            <button
              onClick={() => toggleSection('age')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>वय: {filters.minAge} – {filters.maxAge} वर्षे</span>
              {expandedSections.age ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.age && (
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1">
                  <label className="text-[11px] text-slate-400 block mb-1">किमान वय</label>
                  <input
                    type="number"
                    min={18}
                    max={filters.maxAge}
                    value={filters.minAge}
                    onChange={(e) => onFilterChange({ ...filters, minAge: Number(e.target.value) })}
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <span className="text-slate-300 pt-5">–</span>
                <div className="flex-1">
                  <label className="text-[11px] text-slate-400 block mb-1">कमाल वय</label>
                  <input
                    type="number"
                    min={filters.minAge}
                    max={45}
                    value={filters.maxAge}
                    onChange={(e) => onFilterChange({ ...filters, maxAge: Number(e.target.value) })}
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gotra Filter (Include / Exclude) */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('gotra')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>
                गोत्र ({filters.selectedGotras.length > 0 ? `+${filters.selectedGotras.length}` : ''}
                {filters.excludedGotras.length > 0 ? ` -${filters.excludedGotras.length}` : ''})
              </span>
              {expandedSections.gotra ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.gotra && (
              <div className="space-y-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setGotraMode('include')}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      gotraMode === 'include'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Include ({filters.selectedGotras.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGotraMode('exclude')}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      gotraMode === 'exclude'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Exclude ({filters.excludedGotras.length})
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="गोत्र शोधा..."
                  value={gotraSearch}
                  onChange={(e) => setGotraSearch(e.target.value)}
                  className="w-full py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />

                <div className="max-h-44 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1.5 bg-slate-50/50">
                  {filteredGotras.map((gotra) => {
                    const isIncluded = filters.selectedGotras.includes(gotra);
                    const isExcluded = filters.excludedGotras.includes(gotra);
                    const isCurrentActive = gotraMode === 'include' ? isIncluded : isExcluded;

                    return (
                      <label
                        key={gotra}
                        className={`flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                          isExcluded
                            ? 'bg-rose-50 text-rose-700 font-semibold line-through'
                            : isIncluded
                            ? 'bg-emerald-50 text-emerald-800 font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{gotra}</span>
                        <input
                          type="checkbox"
                          checked={isCurrentActive}
                          onChange={() => toggleGotra(gotra)}
                          className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mulgaon Filter */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('mulgaon')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>मूळगाव ({filters.selectedMulgaons.length > 0 ? filters.selectedMulgaons.length : 'सर्व'})</span>
              {expandedSections.mulgaon ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.mulgaon && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="गाव शोधा (पुणे, मलकापूर...)"
                  value={mulgaonSearch}
                  onChange={(e) => setMulgaonSearch(e.target.value)}
                  className="w-full py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />

                <div className="max-h-44 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1.5 bg-slate-50/50">
                  {filteredMulgaons.map((mulgaon) => {
                    const checked = filters.selectedMulgaons.includes(mulgaon);
                    return (
                      <label
                        key={mulgaon}
                        className={`flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                          checked ? 'bg-rose-50 text-rose-800 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{mulgaon}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMulgaon(mulgaon)}
                          className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
