import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, Database, Check } from 'lucide-react';
import { Profile, ProfileInteraction } from '../types/profile';
import { BookletCandidate } from '../types/candidate';
import { generateCSV, generateBookletCSV, downloadFile } from '../utils/formatters';
import { BottomSheet } from './BottomSheet';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: 'portal' | 'booklet';
  allProfiles: Profile[];
  filteredProfiles: Profile[];
  interactions: Record<string, ProfileInteraction>;
  bookletCandidates: BookletCandidate[];
  filteredBookletCandidates: BookletCandidate[];
  bookletInteractions: Record<string, ProfileInteraction>;
  onImportBackup: (importedInteractions: Record<string, ProfileInteraction>, section: 'portal' | 'booklet') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeSection,
  allProfiles,
  filteredProfiles,
  interactions,
  bookletCandidates,
  filteredBookletCandidates,
  bookletInteractions,
  onImportBackup
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const isBooklet = activeSection === 'booklet';

  const shortlistedPortal = allProfiles.filter(
    (p) => interactions[p.nu_id]?.status === 'shortlisted'
  );
  const shortlistedBooklet = bookletCandidates.filter(
    (c) => bookletInteractions[c.id]?.status === 'shortlisted'
  );

  const handleExportShortlistedCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    if (isBooklet) {
      const csv = generateBookletCSV(shortlistedBooklet, bookletInteractions);
      downloadFile(csv, `LSM_Booklet_Shortlisted_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const csv = generateCSV(shortlistedPortal, interactions);
      downloadFile(csv, `LSM_Portal_Shortlisted_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    }
  };

  const handleExportFilteredCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    if (isBooklet) {
      const csv = generateBookletCSV(filteredBookletCandidates, bookletInteractions);
      downloadFile(csv, `LSM_Booklet_Filtered_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const csv = generateCSV(filteredProfiles, interactions);
      downloadFile(csv, `LSM_Portal_Filtered_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    }
  };

  const handleExportAllCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    if (isBooklet) {
      const csv = generateBookletCSV(bookletCandidates, bookletInteractions);
      downloadFile(csv, `LSM_Booklet_All_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const csv = generateCSV(allProfiles, interactions);
      downloadFile(csv, `LSM_Portal_All_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    }
  };

  const handleExportBackupJSON = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      section: activeSection,
      interactions: isBooklet ? bookletInteractions : interactions,
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    downloadFile(jsonStr, `LSM_Backup_${activeSection}_${dateStr}.json`, 'application/json');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedInteractions = parsed.interactions || parsed;
        const targetSection = parsed.section || activeSection;
        if (typeof importedInteractions === 'object') {
          onImportBackup(importedInteractions, targetSection);
          setImportStatus(`Successfully restored ${Object.keys(importedInteractions).length} decisions to ${targetSection}!`);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 2000);
        } else {
          setImportStatus('Invalid backup file format.');
        }
      } catch (err: any) {
        setImportStatus(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const currentShortlistedCount = isBooklet ? shortlistedBooklet.length : shortlistedPortal.length;
  const currentFilteredCount = isBooklet ? filteredBookletCandidates.length : filteredProfiles.length;
  const currentTotalCount = isBooklet ? bookletCandidates.length : allProfiles.length;
  const sectionLabel = isBooklet ? 'Booklet / Melawa (पुस्तिका)' : 'Online Portal (वेब पोर्टल)';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Backup"
      subtitle={sectionLabel}
      icon={<Download className="w-5 h-5 text-rose-600" />}
      maxWidth="max-w-lg"
      maxHeight="max-h-[88vh]"
    >
      <div className="space-y-4">
        {/* CSV Export Options */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Export to Excel / CSV Spreadsheet
          </h4>

          <button
            onClick={handleExportShortlistedCSV}
            disabled={currentShortlistedCount === 0}
            className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between transition-colors disabled:opacity-50 disabled:cursor-not-allowed group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-xs text-slate-800 block">Export Shortlisted</span>
                <span className="text-[11px] text-slate-500">
                  {currentShortlistedCount} selected as Shortlist (⭐)
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Download CSV
            </span>
          </button>

          <button
            onClick={handleExportFilteredCSV}
            className="w-full p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
              <div>
                <span className="font-bold text-xs text-slate-800 block">Export Active Filtered List</span>
                <span className="text-[11px] text-slate-500">
                  {currentFilteredCount} profiles matching current filters
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              Download CSV
            </span>
          </button>

          <button
            onClick={handleExportAllCSV}
            className="w-full p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
              <div>
                <span className="font-bold text-xs text-slate-800 block">Export Complete {isBooklet ? 'Booklet' : 'Portal'}</span>
                <span className="text-[11px] text-slate-500">{currentTotalCount} candidates total</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              Download CSV
            </span>
          </button>
        </div>

        {/* JSON Backup & Restore */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Triage Backup & Restore
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportBackupJSON}
              className="p-3 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <Database className="w-5 h-5 text-purple-600" />
              <div>
                <span className="font-bold text-xs text-slate-800 block">Backup Decisions</span>
                <span className="text-[10px] text-slate-500">Save notes, ratings, tags</span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <Upload className="w-5 h-5 text-blue-600" />
              <div>
                <span className="font-bold text-xs text-slate-800 block">Restore Backup</span>
                <span className="text-[10px] text-slate-500">Load JSON file</span>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
