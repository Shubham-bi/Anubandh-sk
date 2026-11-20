import Dexie, { Table } from 'dexie';
import { Profile, ProfileInteraction, TriageStatus } from '../types/profile';
import { BookletCandidate } from '../types/candidate';
import { PipelineStage, CallLogEntry } from '../types/pipeline';
import cleanProfilesData from '../data/profiles_clean.json';
import candidatesData from '../data/candidates.json';
import {
  pushPortalInteractionToCloud,
  pushBookletInteractionToCloud,
  pushBookletCandidateToCloud,
  deleteBookletCandidateFromCloud
} from '../services/cloudSync';

export class LSMDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  interactions!: Table<ProfileInteraction, string>;
  comparison!: Table<{ nu_id: string; addedAt: number }, string>;
  booklet_candidates!: Table<BookletCandidate, string>;
  booklet_interactions!: Table<ProfileInteraction, string>;

  constructor() {
    super('LSM_Matrimonial_DB');
    this.version(1).stores({
      profiles: 'nu_id, age, income_num, gotra, nativeDistrict, currentCity, education',
      interactions: 'nu_id, status, rating, updatedAt',
      comparison: 'nu_id, addedAt'
    });
    this.version(2).stores({
      booklet_candidates: 'id, age, gotra, mulgaon',
      booklet_interactions: 'nu_id, status, rating, updatedAt'
    });
  }
}

export const db = new LSMDatabase();

export async function initDatabase(): Promise<{ profilesCount: number; bookletCount: number }> {
  // Purge any removed / blacklisted test profiles from existing IndexedDB
  await db.profiles.delete('15600');
  await db.interactions.delete('15600');
  await db.comparison.delete('15600');

  let pCount = await db.profiles.count();
  if (pCount === 0) {
    console.log('Seeding Dexie IndexedDB with portal profiles...');
    const profiles = cleanProfilesData as Profile[];
    await db.profiles.bulkAdd(profiles);
    pCount = profiles.length;
  }

  let bCount = await db.booklet_candidates.count();
  if (bCount === 0) {
    console.log('Seeding Dexie IndexedDB with booklet candidates...');
    const bookletCandidates = candidatesData as BookletCandidate[];
    await db.booklet_candidates.bulkAdd(bookletCandidates);
    bCount = bookletCandidates.length;
  }

  return { profilesCount: pCount, bookletCount: bCount };
}

// Portal interactions
export async function updateProfileStatus(nu_id: string, status: TriageStatus): Promise<void> {
  const existing = await db.interactions.get(nu_id);
  const updated: ProfileInteraction = {
    nu_id,
    status,
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    rating: existing?.rating || 0,
    updatedAt: Date.now()
  };
  await db.interactions.put(updated);
  pushPortalInteractionToCloud(updated);
}

export async function updateProfileNotes(nu_id: string, notes: string): Promise<void> {
  const existing = await db.interactions.get(nu_id);
  const updated: ProfileInteraction = {
    nu_id,
    status: existing?.status || 'default',
    notes,
    tags: existing?.tags || [],
    rating: existing?.rating || 0,
    updatedAt: Date.now()
  };
  await db.interactions.put(updated);
  pushPortalInteractionToCloud(updated);
}

export async function updateProfileRating(nu_id: string, rating: number): Promise<void> {
  const existing = await db.interactions.get(nu_id);
  const updated: ProfileInteraction = {
    nu_id,
    status: existing?.status || 'default',
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    rating,
    updatedAt: Date.now()
  };
  await db.interactions.put(updated);
  pushPortalInteractionToCloud(updated);
}

export async function addProfileTag(nu_id: string, tag: string): Promise<void> {
  const cleanTag = tag.trim();
  if (!cleanTag) return;
  const existing = await db.interactions.get(nu_id);
  const currentTags = existing?.tags || [];
  if (!currentTags.includes(cleanTag)) {
    const updated: ProfileInteraction = {
      nu_id,
      status: existing?.status || 'default',
      notes: existing?.notes || '',
      tags: [...currentTags, cleanTag],
      rating: existing?.rating || 0,
      updatedAt: Date.now()
    };
    await db.interactions.put(updated);
    pushPortalInteractionToCloud(updated);
  }
}

export async function removeProfileTag(nu_id: string, tag: string): Promise<void> {
  const existing = await db.interactions.get(nu_id);
  if (!existing) return;
  const updated: ProfileInteraction = {
    ...existing,
    tags: (existing.tags || []).filter(t => t !== tag),
    updatedAt: Date.now()
  };
  await db.interactions.put(updated);
  pushPortalInteractionToCloud(updated);
}

// Booklet candidate interactions
export async function updateBookletStatus(id: string, status: TriageStatus): Promise<void> {
  const existing = await db.booklet_interactions.get(id);
  const updated: ProfileInteraction = {
    nu_id: id,
    status,
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    rating: existing?.rating || 0,
    updatedAt: Date.now()
  };
  await db.booklet_interactions.put(updated);
  pushBookletInteractionToCloud(updated);
}

export async function updateBookletNotes(id: string, notes: string): Promise<void> {
  const existing = await db.booklet_interactions.get(id);
  const updated: ProfileInteraction = {
    nu_id: id,
    status: existing?.status || 'default',
    notes,
    tags: existing?.tags || [],
    rating: existing?.rating || 0,
    updatedAt: Date.now()
  };
  await db.booklet_interactions.put(updated);
  pushBookletInteractionToCloud(updated);
}

export async function updateBookletRating(id: string, rating: number): Promise<void> {
  const existing = await db.booklet_interactions.get(id);
  const updated: ProfileInteraction = {
    nu_id: id,
    status: existing?.status || 'default',
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    rating,
    updatedAt: Date.now()
  };
  await db.booklet_interactions.put(updated);
  pushBookletInteractionToCloud(updated);
}

export async function addBookletTag(id: string, tag: string): Promise<void> {
  const cleanTag = tag.trim();
  if (!cleanTag) return;
  const existing = await db.booklet_interactions.get(id);
  const currentTags = existing?.tags || [];
  if (!currentTags.includes(cleanTag)) {
    const updated: ProfileInteraction = {
      nu_id: id,
      status: existing?.status || 'default',
      notes: existing?.notes || '',
      tags: [...currentTags, cleanTag],
      rating: existing?.rating || 0,
      updatedAt: Date.now()
    };
    await db.booklet_interactions.put(updated);
    pushBookletInteractionToCloud(updated);
  }
}

export async function removeBookletTag(id: string, tag: string): Promise<void> {
  const existing = await db.booklet_interactions.get(id);
  if (!existing) return;
  const updated: ProfileInteraction = {
    ...existing,
    tags: (existing.tags || []).filter(t => t !== tag),
    updatedAt: Date.now()
  };
  await db.booklet_interactions.put(updated);
  pushBookletInteractionToCloud(updated);
}

// Comparison
export async function toggleComparison(nu_id: string): Promise<boolean> {
  const exists = await db.comparison.get(nu_id);
  if (exists) {
    await db.comparison.delete(nu_id);
    return false;
  } else {
    const currentCount = await db.comparison.count();
    if (currentCount >= 4) {
      throw new Error('You can compare a maximum of 4 profiles at once.');
    }
    await db.comparison.put({ nu_id, addedAt: Date.now() });
    return true;
  }
}

export async function clearComparison(): Promise<void> {
  await db.comparison.clear();
}

// Candidate CRUD
export async function addBookletCandidate(candidate: BookletCandidate): Promise<void> {
  await db.booklet_candidates.put(candidate);
  pushBookletCandidateToCloud(candidate);
}

export async function updateBookletCandidate(candidate: BookletCandidate): Promise<void> {
  await db.booklet_candidates.put(candidate);
  pushBookletCandidateToCloud(candidate);
}

export async function deleteBookletCandidate(id: string): Promise<void> {
  await db.booklet_candidates.delete(id);
  await db.booklet_interactions.delete(id);
  deleteBookletCandidateFromCloud(id);
}

export async function updatePortalProfile(profile: Profile): Promise<void> {
  await db.profiles.put(profile);
}

export async function deletePortalProfile(nu_id: string): Promise<void> {
  await db.profiles.delete(nu_id);
  await db.interactions.delete(nu_id);
}

// Pipeline Stage & Call Log Tracking
export async function updatePipelineStage(
  id: string,
  stage: PipelineStage,
  isBooklet: boolean
): Promise<void> {
  const table = isBooklet ? db.booklet_interactions : db.interactions;
  const existing = await table.get(id);

  // Map stage to triage status
  let mappedStatus: TriageStatus = 'default';
  if (stage === 'shortlisted') mappedStatus = 'shortlisted';
  else if (stage === 'review' || stage === 'meeting' || stage === 'engaged') mappedStatus = 'review';
  else if (stage === 'contacted') mappedStatus = 'contacted';
  else if (stage === 'passed') mappedStatus = 'not_interested';

  const updated: ProfileInteraction = {
    nu_id: id,
    status: mappedStatus,
    stage: stage,
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    rating: existing?.rating || 0,
    logs: existing?.logs || [],
    updatedAt: Date.now()
  };
  await table.put(updated);
  if (isBooklet) {
    pushBookletInteractionToCloud(updated);
  } else {
    pushPortalInteractionToCloud(updated);
  }
}

export async function addCallLog(
  id: string,
  note: string,
  stage: PipelineStage,
  contactPerson: string | undefined,
  isBooklet: boolean
): Promise<void> {
  const table = isBooklet ? db.booklet_interactions : db.interactions;
  const existing = await table.get(id);
  const currentLogs = existing?.logs || [];

  const newLog: CallLogEntry = {
    id: 'log_' + Date.now(),
    timestamp: Date.now(),
    note,
    stage,
    contactPerson
  };

  const updated: ProfileInteraction = {
    nu_id: id,
    status: existing?.status || 'default',
    stage: stage,
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    rating: existing?.rating || 0,
    logs: [newLog, ...currentLogs],
    updatedAt: Date.now()
  };

  await table.put(updated);
  if (isBooklet) {
    pushBookletInteractionToCloud(updated);
  } else {
    pushPortalInteractionToCloud(updated);
  }
}
