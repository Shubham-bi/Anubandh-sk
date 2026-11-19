import React, { useState } from 'react';
import { Filter, RotateCcw, X, ChevronDown, ChevronUp, Camera, ArrowDownUp } from 'lucide-react';
import { FilterState } from '../types/profile';
import metadata from '../data/filter_metadata.json';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose,
  filteredCount,
  totalCount
}) => {
  const [gotraSearch, setGotraSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [gotraMode, setGotraMode] = useState<'include' | 'exclude'>('include');

  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    age: true,
    income: true,
    gotra: true,
    district: false,
    city: false,
    education: false,
    other: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    onFilterChange({
      ...filters,
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
  };

  const hasActiveFilters =
    filters.minAge > 20 ||
    filters.maxAge < 45 ||
    filters.minIncome > 0 ||
    filters.selectedGotras.length > 0 ||
    filters.excludedGotras.length > 0 ||
    filters.selectedDistricts.length > 0 ||
    filters.selectedCities.length > 0 ||
    filters.selectedEducations.length > 0 ||
    filters.maritalStatus !== 'all' ||
    filters.hasPhotosOnly;

  const filteredGotras = metadata.gotras.filter((g) =>
    g.toLowerCase().includes(gotraSearch.toLowerCase())
  );

  const filteredDistricts = metadata.districts.filter((d) =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredCities = metadata.cities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

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

  const toggleDistrict = (district: string) => {
    const exists = filters.selectedDistricts.includes(district);
    const next = exists
      ? filters.selectedDistricts.filter((d) => d !== district)
      : [...filters.selectedDistricts, district];
    onFilterChange({ ...filters, selectedDistricts: next });
  };

  const toggleCity = (city: string) => {
    const exists = filters.selectedCities.includes(city);
    const next = exists
      ? filters.selectedCities.filter((c) => c !== city)
      : [...filters.selectedCities, city];
    onFilterChange({ ...filters, selectedCities: next });
  };

  const toggleEducation = (edu: string) => {
    const exists = filters.selectedEducations.includes(edu);
    const next = exists
      ? filters.selectedEducations.filter((e) => e !== edu)
      : [...filters.selectedEducations, edu];
    onFilterChange({ ...filters, selectedEducations: next });
  };

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-[85vw] max-w-sm sm:w-80 bg-white border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-10 lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-600" />
            <h2 className="font-bold text-sm text-slate-900">Filter Profiles</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredCount} / {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
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
          {/* Sort By */}
          <div className="pt-2">
            <button
              onClick={() => toggleSection('sort')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span className="flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
                Sort By
              </span>
              {expandedSections.sort ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.sort && (
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium text-slate-700"
              >
                <option value="age_asc">Age: Youngest First</option>
                <option value="age_desc">Age: Oldest First</option>
                <option value="income_desc">Income: Highest to Lowest</option>
                <option value="income_asc">Income: Lowest to Highest</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="updated_desc">Recently Updated</option>
              </select>
            )}
          </div>

          {/* Age Range */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('age')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>Age Range: {filters.minAge} – {filters.maxAge} yrs</span>
              {expandedSections.age ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.age && (
              <div className="space-y-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 block mb-1">Min Age</label>
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
                    <label className="text-[11px] text-slate-400 block mb-1">Max Age</label>
                    <input
                      type="number"
                      min={filters.minAge}
                      max={65}
                      value={filters.maxAge}
                      onChange={(e) => onFilterChange({ ...filters, maxAge: Number(e.target.value) })}
                      className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Minimum Income */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('income')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>Min Annual Income</span>
              {expandedSections.income ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.income && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Any', value: 0 },
                  { label: '≥ ₹3 Lakhs', value: 300000 },
                  { label: '≥ ₹6 Lakhs', value: 600000 },
                  { label: '≥ ₹10 Lakhs', value: 1000000 },
                  { label: '≥ ₹15 Lakhs', value: 1500000 },
                  { label: '≥ ₹25 Lakhs', value: 2500000 },
                ].map((tier) => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, minIncome: tier.value })}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-left transition-all ${
                      filters.minIncome === tier.value
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
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
                Gotra ({filters.selectedGotras.length > 0 ? `+${filters.selectedGotras.length}` : ''}
                {filters.excludedGotras.length > 0 ? ` -${filters.excludedGotras.length}` : ''})
              </span>
              {expandedSections.gotra ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.gotra && (
              <div className="space-y-2">
                {/* Gotra Mode Toggle */}
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
                  placeholder="Search 50+ Gotras..."
                  value={gotraSearch}
                  onChange={(e) => setGotraSearch(e.target.value)}
                  className="w-full py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />

                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1.5 bg-slate-50/50">
                  {filteredGotras.map((gotra) => {
                    const isIncluded = filters.selectedGotras.includes(gotra);
                    const isExcluded = filters.excludedGotras.includes(gotra);
                    const isCurrentModeActive = gotraMode === 'include' ? isIncluded : isExcluded;

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
                          checked={isCurrentModeActive}
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

          {/* Native District */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('district')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>Native District {filters.selectedDistricts.length > 0 && `(${filters.selectedDistricts.length})`}</span>
              {expandedSections.district ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.district && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search districts..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1.5 bg-slate-50/50">
                  {filteredDistricts.slice(0, 30).map((district) => {
                    const checked = filters.selectedDistricts.includes(district);
                    return (
                      <label
                        key={district}
                        className={`flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                          checked ? 'bg-rose-50 text-rose-800 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{district}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDistrict(district)}
                          className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Current City */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('city')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>Current City {filters.selectedCities.length > 0 && `(${filters.selectedCities.length})`}</span>
              {expandedSections.city ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.city && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search city (Pune, Mumbai...)"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1.5 bg-slate-50/50">
                  {filteredCities.slice(0, 30).map((city) => {
                    const checked = filters.selectedCities.includes(city);
                    return (
                      <label
                        key={city}
                        className={`flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                          checked ? 'bg-rose-50 text-rose-800 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{city}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCity(city)}
                          className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="pt-4">
            <button
              onClick={() => toggleSection('education')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-2"
            >
              <span>Education {filters.selectedEducations.length > 0 && `(${filters.selectedEducations.length})`}</span>
              {expandedSections.education ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSections.education && (
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1.5 bg-slate-50/50">
                {metadata.educations.slice(0, 30).map((edu) => {
                  const checked = filters.selectedEducations.includes(edu);
                  return (
                    <label
                      key={edu}
                      className={`flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                        checked ? 'bg-rose-50 text-rose-800 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate pr-2">{edu}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEducation(edu)}
                        className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Toggle Photos Only */}
          <div className="pt-4 pb-6">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Camera className="w-4 h-4 text-slate-400" />
                Only With Photos
              </span>
              <input
                type="checkbox"
                checked={filters.hasPhotosOnly}
                onChange={(e) => onFilterChange({ ...filters, hasPhotosOnly: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
            </label>
          </div>
        </div>
      </aside>
    </>
  );
};
