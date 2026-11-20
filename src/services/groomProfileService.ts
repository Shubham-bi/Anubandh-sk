import { ref, set, onValue } from 'firebase/database';
import { rtdb } from './firebase';
import { clearBiodataCanvasCache } from '../utils/biodataCanvasGenerator';

const STORAGE_KEY = 'anubandh_groom_photo_v1';
const RTDB_PATH = 'anubandh/groom_profile';

export interface GroomProfileCloudData {
  photo: string | null;
  updatedAt: number;
}

/**
 * Synchronously retrieves the cached groom photo for 0ms initial render
 */
export function getCachedGroomPhoto(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves a new groom photo locally and syncs to Firebase Realtime Database
 */
export async function saveGroomPhoto(photoDataUrl: string): Promise<void> {
  const updatedAt = Date.now();

  // 1. Instant local persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, photoDataUrl);
      window.dispatchEvent(new CustomEvent('anubandh-groom-photo-changed', { detail: photoDataUrl }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Clear cached canvas so new download includes this photo
  clearBiodataCanvasCache();

  // 2. Cloud sync to Firebase RTDB
  try {
    const groomRef = ref(rtdb, RTDB_PATH);
    await set(groomRef, {
      photo: photoDataUrl,
      updatedAt
    });
  } catch (err) {
    console.warn('Firebase RTDB groom photo sync error:', err);
  }
}

/**
 * Removes the groom photo locally and from Firebase Realtime Database
 */
export async function removeGroomPhoto(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('anubandh-groom-photo-changed', { detail: null }));
    } catch (e) {
      console.warn('LocalStorage removal error:', e);
    }
  }

  clearBiodataCanvasCache();

  try {
    const groomRef = ref(rtdb, RTDB_PATH);
    await set(groomRef, {
      photo: null,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn('Firebase RTDB groom photo removal error:', err);
  }
}

/**
 * Subscribes to groom photo updates (both local tab events and Firebase cloud sync)
 */
export function subscribeGroomPhoto(callback: (photo: string | null) => void): () => void {
  // Initial callback with local cached value
  callback(getCachedGroomPhoto());

  // Local window event listener (for instant same-browser updates)
  const handleLocalChange = (e: any) => {
    callback(e.detail);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('anubandh-groom-photo-changed', handleLocalChange);
  }

  // Firebase Realtime Database listener (for cross-device / remote sync)
  const groomRef = ref(rtdb, RTDB_PATH);
  const unsubscribeFirebase = onValue(groomRef, (snapshot) => {
    const val = snapshot.val() as GroomProfileCloudData | null;
    if (val !== undefined && val !== null) {
      const remotePhoto = val.photo || null;
      const localPhoto = getCachedGroomPhoto();

      if (remotePhoto !== localPhoto) {
        if (remotePhoto) {
          try {
            localStorage.setItem(STORAGE_KEY, remotePhoto);
          } catch (e) {
            console.warn('Could not cache remote photo:', e);
          }
        } else {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            console.warn('Could not clear local photo cache:', e);
          }
        }
        clearBiodataCanvasCache();
        callback(remotePhoto);
      }
    } else {
      // If cloud is empty but we have local photo, seed local to cloud
      const localPhoto = getCachedGroomPhoto();
      if (localPhoto) {
        set(groomRef, {
          photo: localPhoto,
          updatedAt: Date.now()
        }).catch(() => {});
      }
    }
  }, (err) => {
    console.warn('Firebase groom photo listener warning:', err);
  });

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('anubandh-groom-photo-changed', handleLocalChange);
    }
    unsubscribeFirebase();
  };
}
