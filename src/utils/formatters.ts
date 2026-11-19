import { Profile, ProfileInteraction } from '../types/profile';
import { BookletCandidate, cleanMarathiPhone } from '../types/candidate';
import { buildCandidateProposalMessage } from './messages';

export function formatINR(val: number): string {
  if (!val || val === 0) return 'Not Specified';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export function cleanPhone(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[^\d]/g, '');
}

export function getWhatsAppLink(phone: string, profileName: string, fatherName?: string, srNo?: string): string {
  const digits = cleanPhone(phone);
  if (!digits) return '';
  const countryPhone = digits.length === 10 ? `91${digits}` : digits;
  const message = buildCandidateProposalMessage({
    candidateName: profileName,
    guardianName: fatherName,
    srNo: srNo
  });
  return `https://wa.me/${countryPhone}?text=${encodeURIComponent(message)}`;
}

export function getTelLink(phone: string): string {
  const digits = cleanPhone(phone);
  return digits ? `tel:${digits}` : '';
}

export function generateCSV(profiles: Profile[], interactions: Record<string, ProfileInteraction>): string {
  const headers = [
    'NU ID',
    'Full Name',
    'Status',
    'Rating',
    'Tags',
    'Age',
    'Height',
    'Gotra',
    'Mamkul',
    'Education',
    'Occupation',
    'Income',
    'Native District',
    'Native Place',
    'Current City',
    'Mobile 1',
    'Mobile 2',
    'Father Name',
    'Father Occupation',
    'Father Mobile',
    'Mother Name',
    'Brothers',
    'Sisters',
    'Notes'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = profiles.map((p) => {
    const inter = interactions[p.nu_id] || { status: 'default', rating: 0, tags: [], notes: '' };
    return [
      escapeCSV(p.nu_id),
      escapeCSV(p.name),
      escapeCSV(inter.status),
      escapeCSV(inter.rating || ''),
      escapeCSV((inter.tags || []).join('; ')),
      escapeCSV(p.age),
      escapeCSV(p.height),
      escapeCSV(p.gotra),
      escapeCSV(p.mamkul),
      escapeCSV(p.education),
      escapeCSV(p.occupation),
      escapeCSV(p.income_label),
      escapeCSV(p.nativeDistrict),
      escapeCSV(p.nativePlace),
      escapeCSV(p.currentCity),
      escapeCSV(p.mobile1),
      escapeCSV(p.mobile2),
      escapeCSV(p.fatherName),
      escapeCSV(p.fatherOccupation),
      escapeCSV(p.fatherMobile),
      escapeCSV(p.motherName),
      escapeCSV(p.brothers),
      escapeCSV(p.sisters),
      escapeCSV(inter.notes || '')
    ].join(',');
  });

  // UTF-8 BOM for Microsoft Excel compatibility
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateBookletCSV(candidates: BookletCandidate[], interactions: Record<string, ProfileInteraction>): string {
  const headers = [
    'ID',
    'Sr No',
    'Name',
    'Status',
    'Rating',
    'Tags',
    'Age',
    'Height',
    'Complexion',
    'Gotra',
    'Mamkul',
    'Birth Date',
    'Birth Time',
    'Blood Group',
    'Mulgaon',
    'Education & Job',
    'Family',
    'Expectations',
    'Phones',
    'Contact Details',
    'Private Notes'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = candidates.map((c) => {
    const inter = interactions[c.id] || { status: 'default', rating: 0, tags: [], notes: '' };
    return [
      escapeCSV(c.id),
      escapeCSV(c.sr),
      escapeCSV(c.name),
      escapeCSV(inter.status),
      escapeCSV(inter.rating || ''),
      escapeCSV((inter.tags || []).join('; ')),
      escapeCSV(c.age),
      escapeCSV(c.height),
      escapeCSV(c.complexion),
      escapeCSV(c.gotra),
      escapeCSV(c.mamkul),
      escapeCSV(c.date),
      escapeCSV(c.time),
      escapeCSV(c.blood),
      escapeCSV(c.mulgaon),
      escapeCSV(c.edu),
      escapeCSV(c.fam),
      escapeCSV(c.exp),
      escapeCSV((c.phones || []).map((p) => cleanMarathiPhone(p)).join('; ')),
      escapeCSV(c.contact),
      escapeCSV(inter.notes || '')
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}
