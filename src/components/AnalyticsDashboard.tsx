import React, { useState, useMemo } from 'react';
import { Profile, ProfileInteraction } from '../types/profile';
import { BookletCandidate } from '../types/candidate';
import {
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  HeartHandshake,
  TrendingUp,
  MapPin,
  GraduationCap,
  IndianRupee,
  Layers,
  Sparkles,
  Calendar,
  XCircle
} from 'lucide-react';

interface AnalyticsDashboardProps {
  portalProfiles: Profile[];
  portalInteractions: Record<string, ProfileInteraction>;
  bookletCandidates: BookletCandidate[];
  bookletInteractions: Record<string, ProfileInteraction>;
  onNavigateToSection: (section: 'portal' | 'booklet' | 'kanban') => void;
}

export const AnalyticsDashboardComponent: React.FC<AnalyticsDashboardProps> = ({
  portalProfiles,
  portalInteractions,
  bookletCandidates,
  bookletInteractions,
  onNavigateToSection
}) => {
  const [dataScope, setDataScope] = useState<'all' | 'portal' | 'booklet'>('all');

  // Combined candidates unified for analytics
  const unifiedCandidates = useMemo(() => {
    const list: {
      id: string;
      name: string;
      age: number;
      gotra: string;
      district: string;
      city: string;
      education: string;
      income: number;
      isBooklet: boolean;
      status: string;
      stage: string;
    }[] = [];

    if (dataScope === 'all' || dataScope === 'portal') {
      for (const p of portalProfiles) {
        const inter = portalInteractions[p.nu_id];
        list.push({
          id: p.nu_id,
          name: p.name,
          age: p.age || 25,
          gotra: p.gotra || 'अज्ञात',
          district: p.nativeDistrict || 'जळगाव',
          city: p.currentCity || p.nativeDistrict || 'जळगाव',
          education: p.education || '',
          income: p.income_num || 0,
          isBooklet: false,
          status: inter?.status || 'default',
          stage: inter?.stage || (inter?.status === 'shortlisted' ? 'shortlisted' : 'unreviewed')
        });
      }
    }

    if (dataScope === 'all' || dataScope === 'booklet') {
      for (const b of bookletCandidates) {
        const inter = bookletInteractions[b.id];
        list.push({
          id: b.id,
          name: b.name,
          age: b.age || 25,
          gotra: b.gotra || 'अज्ञात',
          district: b.mulgaon?.includes('बुलडाणा') ? 'बुलडाणा' : 'जळगाव',
          city: b.mulgaon || 'मलकापूर',
          education: b.edu || '',
          income: 0,
          isBooklet: true,
          status: inter?.status || 'default',
          stage: inter?.stage || (inter?.status === 'shortlisted' ? 'shortlisted' : 'unreviewed')
        });
      }
    }

    return list;
  }, [portalProfiles, portalInteractions, bookletCandidates, bookletInteractions, dataScope]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = unifiedCandidates.length;
    let shortlisted = 0;
    let review = 0;
    let contacted = 0;
    let engaged = 0;
    let passed = 0;
    let unreviewed = 0;

    for (const c of unifiedCandidates) {
      if (c.stage === 'engaged') engaged++;
      else if (c.stage === 'shortlisted' || c.status === 'shortlisted') shortlisted++;
      else if (c.stage === 'review' || c.stage === 'meeting' || c.status === 'review') review++;
      else if (c.stage === 'contacted' || c.status === 'contacted') contacted++;
      else if (c.stage === 'passed' || c.status === 'not_interested') passed++;
      else unreviewed++;
    }

    const reviewed = shortlisted + review + contacted + engaged + passed;
    const reviewedPercent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

    return {
      total,
      shortlisted,
      review,
      contacted,
      engaged,
      passed,
      unreviewed,
      reviewedPercent
    };
  }, [unifiedCandidates]);

  // Age Distribution
  const ageDistribution = useMemo(() => {
    const brackets = [
      { label: '२० - २३ वर्षे', min: 20, max: 23, count: 0 },
      { label: '२४ - २६ वर्षे', min: 24, max: 26, count: 0 },
      { label: '२७ - २९ वर्षे', min: 27, max: 29, count: 0 },
      { label: '३० - ३२ वर्षे', min: 30, max: 32, count: 0 },
      { label: '३३ - ३५ वर्षे', min: 33, max: 35, count: 0 },
      { label: '३६+ वर्षे', min: 36, max: 99, count: 0 }
    ];

    for (const c of unifiedCandidates) {
      for (const b of brackets) {
        if (c.age >= b.min && c.age <= b.max) {
          b.count++;
          break;
        }
      }
    }
    const maxCount = Math.max(...brackets.map((b) => b.count), 1);
    return brackets.map((b) => ({
      ...b,
      percent: Math.round((b.count / (unifiedCandidates.length || 1)) * 100),
      barRatio: Math.round((b.count / maxCount) * 100)
    }));
  }, [unifiedCandidates]);

  // Gotra Ranking
  const gotraRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of unifiedCandidates) {
      const g = c.gotra.trim();
      if (g && g !== 'अज्ञात' && g !== 'NA' && g !== '-') {
        counts[g] = (counts[g] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map((g) => ({
      ...g,
      barRatio: Math.round((g.count / maxCount) * 100),
      percent: Math.round((g.count / (unifiedCandidates.length || 1)) * 100)
    }));
  }, [unifiedCandidates]);

  // District / Location Ranking
  const locationRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of unifiedCandidates) {
      const loc = c.district || c.city || 'जळगाव';
      if (loc) {
        counts[loc] = (counts[loc] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map((loc) => ({
      ...loc,
      barRatio: Math.round((loc.count / maxCount) * 100),
      percent: Math.round((loc.count / (unifiedCandidates.length || 1)) * 100)
    }));
  }, [unifiedCandidates]);

  // Education Breakdown
  const educationBreakdown = useMemo(() => {
    const categories = [
      { label: 'Engineering & Tech (इंजिनिअरिंग / IT)', count: 0, color: 'bg-indigo-500' },
      { label: 'Medical, Pharmacy & Science (वैद्यकीय / औषधनिर्माण)', count: 0, color: 'bg-emerald-500' },
      { label: 'Management, Commerce & CA (व्यवस्थापन / वित्त)', count: 0, color: 'bg-amber-500' },
      { label: 'Post-Graduate & Master Degree (पदव्युत्तर शिक्षण)', count: 0, color: 'bg-rose-500' },
      { label: 'Government & Other Degree (इतर पदवीधर / शासकीय)', count: 0, color: 'bg-slate-500' }
    ];

    for (const c of unifiedCandidates) {
      const edu = c.education.toLowerCase();
      if (/b\.?e|tech|eng|it|software|comp|mca|bca|engineer/i.test(edu)) {
        categories[0].count++;
      } else if (/mbbs|bams|bhms|b\.?pharm|m\.?pharm|doctor|medic|pharma|biotech/i.test(edu)) {
        categories[1].count++;
      } else if (/mba|ca|cs|cfa|b\.?com|m\.?com|finance|bank/i.test(edu)) {
        categories[2].count++;
      } else if (/m\.?sc|m\.?a|master|pg/i.test(edu)) {
        categories[3].count++;
      } else {
        categories[4].count++;
      }
    }

    const total = unifiedCandidates.length || 1;
    return categories.map((cat) => ({
      ...cat,
      percent: Math.round((cat.count / total) * 100)
    }));
  }, [unifiedCandidates]);

  // Income Brackets (for Portal profiles)
  const incomeBrackets = useMemo(() => {
    const brackets = [
      { label: '₹० - ₹३ लाख', min: 0, max: 300000, count: 0 },
      { label: '₹३ - ₹६ लाख', min: 300001, max: 600000, count: 0 },
      { label: '₹६ - ₹१० लाख', min: 600001, max: 1000000, count: 0 },
      { label: '₹१० - ₹१५ लाख', min: 1000001, max: 1500000, count: 0 },
      { label: '₹१५ - ₹२५ लाख', min: 1500001, max: 2500000, count: 0 },
      { label: '₹२५ लाख +', min: 2500001, max: 100000000, count: 0 }
    ];

    for (const p of portalProfiles) {
      const inc = p.income_num || 0;
      for (const b of brackets) {
        if (inc >= b.min && inc <= b.max) {
          b.count++;
          break;
        }
      }
    }

    const maxCount = Math.max(...brackets.map((b) => b.count), 1);
    return brackets.map((b) => ({
      ...b,
      percent: Math.round((b.count / (portalProfiles.length || 1)) * 100),
      barRatio: Math.round((b.count / maxCount) * 100)
    }));
  }, [portalProfiles]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Scope Switcher */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              मॅचमेकिंग ॲनालिटिक्स व प्रगती डॅशबोर्ड
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl">
            १,३०८ लेवा पाटीदार स्थळांचे संपूर्ण विश्लेषण, पाईपलाईन प्रगती, वय, गोत्र, शिक्षण व उत्पन्न सांख्यिकी.
          </p>
        </div>

        {/* Scope Selector Tabs */}
        <div className="bg-white/15 p-1 rounded-2xl flex items-center gap-1 backdrop-blur-md border border-white/20 self-stretch sm:self-auto overflow-x-auto thin-scrollbar flex-nowrap">
          <button
            onClick={() => setDataScope('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              dataScope === 'all' ? 'bg-white text-slate-900 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            सर्व डेटा ({portalProfiles.length + bookletCandidates.length})
          </button>
          <button
            onClick={() => setDataScope('portal')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              dataScope === 'portal' ? 'bg-white text-rose-800 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            🌐 पोर्टल ({portalProfiles.length})
          </button>
          <button
            onClick={() => setDataScope('booklet')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              dataScope === 'booklet' ? 'bg-white text-amber-800 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            📖 पुस्तिका ({bookletCandidates.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Profiles */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">एकूण स्थळे</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span className="text-rose-600 font-bold">{stats.reviewedPercent}%</span> तपासणी पूर्ण
          </div>
        </div>

        {/* Shortlisted */}
        <div
          onClick={() => onNavigateToSection('kanban')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">शॉर्टलिस्ट</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 group-hover:scale-105 transition-transform origin-left">
            {stats.shortlisted}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {Math.round((stats.shortlisted / (stats.total || 1)) * 100)}% निवडलेली स्थळे
          </div>
        </div>

        {/* Family Review */}
        <div
          onClick={() => onNavigateToSection('kanban')}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">कौटुंबिक चर्चा</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 group-hover:scale-105 transition-transform origin-left">
            {stats.review}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">विचारार्थ असलेले</div>
        </div>

        {/* Contacted */}
        <div
          onClick={() => onNavigateToSection('kanban')}
          className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">संपर्क केला</span>
            <PhoneCall className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 group-hover:scale-105 transition-transform origin-left">
            {stats.contacted}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">फोन चर्चा सुरू</div>
        </div>

        {/* Engaged */}
        <div
          onClick={() => onNavigateToSection('kanban')}
          className="bg-white p-4 rounded-2xl border border-pink-200 shadow-xs hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-pink-50/40 to-white"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700">जमले (Engaged)</span>
            <HeartHandshake className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-black text-pink-600 group-hover:scale-105 transition-transform origin-left">
            {stats.engaged}
          </div>
          <div className="text-[10px] text-pink-600 font-bold mt-1">यशस्वी स्थळे 🎉</div>
        </div>

        {/* Passed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">वगळले (Pass)</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-600">{stats.passed}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">अनुरूप नसलेले</div>
        </div>
      </div>

      {/* Pipeline Funnel & Stage Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              मॅचमेकिंग पाईपलाईन प्रगती फनेल (Pipeline Conversion)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक टप्प्यावरील उमेदवारांची संख्या व एकूण प्रगती टक्केवारी.
            </p>
          </div>
          <button
            onClick={() => onNavigateToSection('kanban')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors self-start sm:self-auto"
          >
            कानबान बोर्ड उघडा →
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(stats.engaged / (stats.total || 1)) * 100}%` }}
            className="bg-pink-600 transition-all duration-500"
            title={`जमले: ${stats.engaged}`}
          />
          <div
            style={{ width: `${(stats.contacted / (stats.total || 1)) * 100}%` }}
            className="bg-blue-600 transition-all duration-500"
            title={`संपर्क झाला: ${stats.contacted}`}
          />
          <div
            style={{ width: `${(stats.review / (stats.total || 1)) * 100}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`कौटुंबिक चर्चा: ${stats.review}`}
          />
          <div
            style={{ width: `${(stats.shortlisted / (stats.total || 1)) * 100}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`शॉर्टलिस्ट: ${stats.shortlisted}`}
          />
          <div
            style={{ width: `${(stats.passed / (stats.total || 1)) * 100}%` }}
            className="bg-slate-400 transition-all duration-500"
            title={`वगळले: ${stats.passed}`}
          />
        </div>

        {/* Funnel Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-slate-400 block font-semibold text-[10px]">१. विचारार्थ / नवीन</span>
            <span className="text-lg font-black text-slate-800">{stats.unreviewed}</span>
            <span className="text-[10px] text-slate-400 block">
              {Math.round((stats.unreviewed / (stats.total || 1)) * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-xs">
            <span className="text-emerald-700 block font-semibold text-[10px]">२. शॉर्टलिस्ट</span>
            <span className="text-lg font-black text-emerald-800">{stats.shortlisted}</span>
            <span className="text-[10px] text-emerald-600 block">
              {Math.round((stats.shortlisted / (stats.total || 1)) * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs">
            <span className="text-amber-700 block font-semibold text-[10px]">३. कौटुंबिक चर्चा</span>
            <span className="text-lg font-black text-amber-800">{stats.review}</span>
            <span className="text-[10px] text-amber-600 block">
              {Math.round((stats.review / (stats.total || 1)) * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/70 text-xs">
            <span className="text-blue-700 block font-semibold text-[10px]">४. संपर्क केला</span>
            <span className="text-lg font-black text-blue-800">{stats.contacted}</span>
            <span className="text-[10px] text-blue-600 block">
              {Math.round((stats.contacted / (stats.total || 1)) * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200/70 text-xs">
            <span className="text-pink-700 block font-semibold text-[10px]">५. जमले! (Engaged)</span>
            <span className="text-lg font-black text-pink-800">{stats.engaged}</span>
            <span className="text-[10px] text-pink-600 block">
              {Math.round((stats.engaged / (stats.total || 1)) * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
            <span className="text-slate-500 block font-semibold text-[10px]">६. वगळले (Pass)</span>
            <span className="text-lg font-black text-slate-700">{stats.passed}</span>
            <span className="text-[10px] text-slate-500 block">
              {Math.round((stats.passed / (stats.total || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Age Distribution & Top Gotras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Demographics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              वय गट वितरण (Age Demographics)
            </h3>
            <span className="text-xs font-semibold text-slate-400">उमेदवार संख्या</span>
          </div>

          <div className="space-y-3">
            {ageDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{item.percent}%</span>
                    <span className="font-bold text-slate-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.barRatio}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gotra Ranking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              प्रमुख १० गोत्रे (Top 10 Gotras)
            </h3>
            <span className="text-xs font-semibold text-slate-400">नोंदणी</span>
          </div>

          <div className="space-y-2.5">
            {gotraRanking.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{item.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{item.percent}%</span>
                    <span className="font-bold text-slate-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.barRatio}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Native Locations & Education Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District & Native Places */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              मुळगाव व जिल्हे वितरण (Top Locations)
            </h3>
            <span className="text-xs font-semibold text-slate-400">स्थानिक संख्या</span>
          </div>

          <div className="space-y-2.5">
            {locationRanking.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{item.percent}%</span>
                    <span className="font-bold text-slate-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.barRatio}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Categories */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              शिक्षण व करिअर शाखा (Education Categories)
            </h3>
            <span className="text-xs font-semibold text-slate-400">टक्केवारी</span>
          </div>

          <div className="space-y-3.5">
            {educationBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.label}</span>
                  <span className="font-bold text-slate-900">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.percent}%` }}
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Annual Income Distribution (Portal Profiles) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-600" />
              वार्षिक उत्पन्न गट (Annual Income Brackets)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              पोर्टलवरील १,२२४ उमेदवारांच्या नोंदणीकृत उत्पन्नाचे वर्गीकरण
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl self-start sm:self-auto border border-amber-200">
            लखोजी / पॅकेज विश्लेषण
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {incomeBrackets.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-md transition-all"
            >
              <div className="text-[11px] font-bold text-slate-700">{item.label}</div>
              <div className="text-lg font-black text-slate-900">{item.count}</div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  style={{ width: `${item.barRatio}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{item.percent}% स्थळे</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AnalyticsDashboard = React.memo(AnalyticsDashboardComponent);