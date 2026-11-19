export type PipelineStage =
  | 'unreviewed'
  | 'shortlisted'
  | 'review'
  | 'contacted'
  | 'meeting'
  | 'engaged'
  | 'passed';

export interface StageDefinition {
  id: PipelineStage;
  title: string;
  titleMr: string;
  color: string;
  badgeColor: string;
  icon: string;
}

export const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: 'unreviewed',
    title: 'New / Unreviewed',
    titleMr: 'नवीन / न पाहिलेले',
    color: 'border-slate-300 bg-slate-50',
    badgeColor: 'bg-slate-200 text-slate-700',
    icon: '📥',
  },
  {
    id: 'shortlisted',
    title: 'Shortlisted',
    titleMr: 'शॉर्टलिस्ट केलेले',
    color: 'border-emerald-300 bg-emerald-50/30',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    icon: '⭐',
  },
  {
    id: 'review',
    title: 'Under Family Review',
    titleMr: 'कुटुंबात विचारार्थ',
    color: 'border-amber-300 bg-amber-50/30',
    badgeColor: 'bg-amber-100 text-amber-800',
    icon: '⏳',
  },
  {
    id: 'contacted',
    title: 'Contacted / Called',
    titleMr: 'संपर्क / फोन झाला',
    color: 'border-blue-300 bg-blue-50/30',
    badgeColor: 'bg-blue-100 text-blue-800',
    icon: '📞',
  },
  {
    id: 'meeting',
    title: 'Meeting Scheduled',
    titleMr: 'प्रत्यक्ष भेट ठरली',
    color: 'border-purple-300 bg-purple-50/30',
    badgeColor: 'bg-purple-100 text-purple-800',
    icon: '🤝',
  },
  {
    id: 'engaged',
    title: 'Engaged / Fixed',
    titleMr: 'लग्न ठरले (यशस्वी)',
    color: 'border-rose-300 bg-rose-50/30',
    badgeColor: 'bg-rose-100 text-rose-800',
    icon: '💍',
  },
  {
    id: 'passed',
    title: 'Archived / Passed',
    titleMr: 'वगळलेले / फाईल बंद',
    color: 'border-slate-200 bg-slate-100/50',
    badgeColor: 'bg-slate-200 text-slate-500',
    icon: '❌',
  },
];

export interface CallLogEntry {
  id: string;
  timestamp: number;
  note: string;
  stage: PipelineStage;
  contactPerson?: string;
}
