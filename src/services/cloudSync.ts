import { ref, set, remove, onValue, get } from 'firebase/database';
import { rtdb } from './firebase';
import { db } from '../db';
import { ProfileInteraction } from '../types/profile';
import { BookletCandidate } from '../types/candidate';

type SyncStatus = 'connected' | 'connecting' | 'offline' | 'error';
type SyncCallback = (status: SyncStatus) => void;

const listeners: Set<SyncCallback> = new Set();
let currentStatus: SyncStatus = 'connecting';
let isInitialized = false;

// Flags to prevent echo loops
let isSyncingFromCloud = false;

function setStatus(status: SyncStatus) {
  currentStatus = status;
  listeners.forEach(cb => cb(status));
}

export function subscribeSyncStatus(cb: SyncCallback): () => void {
  listeners.add(cb);
  cb(currentStatus);
  return () => listeners.delete(cb);
}

/**
 * Pushes a single portal interaction to Firebase RTDB
 */
export async function pushPortalInteractionToCloud(interaction: ProfileInteraction): Promise<void> {
  if (isSyncingFromCloud) return;
  try {
    const itemRef = ref(rtdb, `anubandh/portal_interactions/${interaction.nu_id}`);
    await set(itemRef, interaction);
  } catch (err) {
    console.warn('Error pushing portal interaction to cloud:', err);
  }
}

/**
 * Pushes a single booklet candidate interaction to Firebase RTDB
 */
export async function pushBookletInteractionToCloud(interaction: ProfileInteraction): Promise<void> {
  if (isSyncingFromCloud) return;
  try {
    const itemRef = ref(rtdb, `anubandh/booklet_interactions/${interaction.nu_id}`);
    await set(itemRef, interaction);
  } catch (err) {
    console.warn('Error pushing booklet interaction to cloud:', err);
  }
}

/**
 * Pushes a booklet candidate (created or edited) to Firebase RTDB
 */
export async function pushBookletCandidateToCloud(candidate: BookletCandidate): Promise<void> {
  if (isSyncingFromCloud) return;
  try {
    const itemRef = ref(rtdb, `anubandh/booklet_candidates/${candidate.id}`);
    await set(itemRef, candidate);
  } catch (err) {
    console.warn('Error pushing booklet candidate to cloud:', err);
  }
}

/**
 * Deletes a booklet candidate from Firebase RTDB
 */
export async function deleteBookletCandidateFromCloud(id: string): Promise<void> {
  if (isSyncingFromCloud) return;
  try {
    const itemRef = ref(rtdb, `anubandh/booklet_candidates/${id}`);
    const interactionRef = ref(rtdb, `anubandh/booklet_interactions/${id}`);
    await Promise.all([remove(itemRef), remove(interactionRef)]);
  } catch (err) {
    console.warn('Error removing booklet candidate from cloud:', err);
  }
}

/**
 * Initializes two-way bidirectional sync between local Dexie IndexedDB and Firebase RTDB
 */
export async function initCloudSync(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  // 1. Monitor network connection to Firebase
  const connectedRef = ref(rtdb, '.info/connected');
  onValue(connectedRef, snap => {
    const isConnected = !!snap.val();
    setStatus(isConnected ? 'connected' : 'offline');
  });

  // 2. Initial Up-Sync (Upload existing local interactions if cloud has nothing)
  try {
    const [portalSnap, bookletSnap, candSnap] = await Promise.all([
      get(ref(rtdb, 'anubandh/portal_interactions')),
      get(ref(rtdb, 'anubandh/booklet_interactions')),
      get(ref(rtdb, 'anubandh/booklet_candidates'))
    ]);

    // Seed local interactions to cloud if cloud is currently empty
    if (!portalSnap.exists()) {
      const localPortalInteractions = await db.interactions.toArray();
      if (localPortalInteractions.length > 0) {
        const payload: Record<string, ProfileInteraction> = {};
        localPortalInteractions.forEach(item => {
          payload[item.nu_id] = item;
        });
        await set(ref(rtdb, 'anubandh/portal_interactions'), payload);
      }
    }

    if (!bookletSnap.exists()) {
      const localBookletInteractions = await db.booklet_interactions.toArray();
      if (localBookletInteractions.length > 0) {
        const payload: Record<string, ProfileInteraction> = {};
        localBookletInteractions.forEach(item => {
          payload[item.nu_id] = item;
        });
        await set(ref(rtdb, 'anubandh/booklet_interactions'), payload);
      }
    }

    if (!candSnap.exists()) {
      // Seed booklet candidates (custom added candidates or overrides)
      const allCandidates = await db.booklet_candidates.toArray();
      if (allCandidates.length > 0) {
        const payload: Record<string, BookletCandidate> = {};
        allCandidates.forEach(item => {
          payload[item.id] = item;
        });
        await set(ref(rtdb, 'anubandh/booklet_candidates'), payload);
      }
    }
  } catch (err) {
    console.warn('Initial cloud sync check error:', err);
  }

  // 3. Real-time Listener: Portal Interactions (Cloud -> Local Dexie)
  const portalInteractionsRef = ref(rtdb, 'anubandh/portal_interactions');
  onValue(portalInteractionsRef, async snapshot => {
    const val = snapshot.val();
    if (!val) return;

    try {
      isSyncingFromCloud = true;
      const remoteItems: ProfileInteraction[] = Object.values(val);
      for (const remote of remoteItems) {
        const local = await db.interactions.get(remote.nu_id);
        if (!local || (remote.updatedAt && (!local.updatedAt || remote.updatedAt > local.updatedAt))) {
          await db.interactions.put(remote);
        }
      }
    } catch (err) {
      console.warn('Failed to apply portal interactions from cloud:', err);
    } finally {
      isSyncingFromCloud = false;
    }
  });

  // 4. Real-time Listener: Booklet Interactions (Cloud -> Local Dexie)
  const bookletInteractionsRef = ref(rtdb, 'anubandh/booklet_interactions');
  onValue(bookletInteractionsRef, async snapshot => {
    const val = snapshot.val();
    if (!val) return;

    try {
      isSyncingFromCloud = true;
      const remoteItems: ProfileInteraction[] = Object.values(val);
      for (const remote of remoteItems) {
        const local = await db.booklet_interactions.get(remote.nu_id);
        if (!local || (remote.updatedAt && (!local.updatedAt || remote.updatedAt > local.updatedAt))) {
          await db.booklet_interactions.put(remote);
        }
      }
    } catch (err) {
      console.warn('Failed to apply booklet interactions from cloud:', err);
    } finally {
      isSyncingFromCloud = false;
    }
  });

  // 5. Real-time Listener: Booklet Candidates (Cloud -> Local Dexie)
  const bookletCandidatesRef = ref(rtdb, 'anubandh/booklet_candidates');
  onValue(bookletCandidatesRef, async snapshot => {
    const val = snapshot.val();
    if (!val) return;

    try {
      isSyncingFromCloud = true;
      const remoteCandidates: BookletCandidate[] = Object.values(val);
      for (const cand of remoteCandidates) {
        const local = await db.booklet_candidates.get(cand.id);
        // Put or update in local Dexie
        if (!local || JSON.stringify(local) !== JSON.stringify(cand)) {
          await db.booklet_candidates.put(cand);
        }
      }
    } catch (err) {
      console.warn('Failed to apply booklet candidates from cloud:', err);
    } finally {
      isSyncingFromCloud = false;
    }
  });
}
