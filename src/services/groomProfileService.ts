import { ref, set, onValue } from 'firebase/database';
import { rtdb } from './firebase';
import { clearBiodataCanvasCache } from '../utils/biodataCanvasGenerator';
import { DEFAULT_GROOM_PHOTO_CDN } from '../utils/googleDriveHelper';

const STORAGE_KEY = 'anubandh_groom_photo_v1';
const RTDB_PATH = 'anubandh/groom_profile';

export interface GroomProfileCloudData {
  photo: string | null;
  updatedAt: number;
}

/**
 * Synchronously retrieves the cached groom photo for 0ms initial render.
 * Returns default Google Drive photo link on fresh installs, or null if explicitly removed.
 */
export function getCachedGroomPhoto(): string | null {
  if (typeof window === 'undefined') return DEFAULT_GROOM_PHOTO_CDN;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === '__REMOVED__') {
      return null;
    }
    if (val && val.trim().length > 0) {
      return val;
    }
    return DEFAULT_GROOM_PHOTO_CDN;
  } catch {
    return DEFAULT_GROOM_PHOTO_CDN;
  }
}

/**
 * Saves a new groom photo (base64 WebP or Google Drive CDN URL) locally and syncs to Firebase
 */
export async function saveGroomPhoto(photoUrl: string): Promise<void> {
  const updatedAt = Date.now();

  // 1. Instant local persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, photoUrl);
      window.dispatchEvent(new CustomEvent('anubandh-groom-photo-changed', { detail: photoUrl }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Clear cached canvas if any
  clearBiodataCanvasCache();

  // 2. Cloud sync to Firebase RTDB
  try {
    const groomRef = ref(rtdb, RTDB_PATH);
    await set(groomRef, {
      photo: photoUrl,
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
      localStorage.setItem(STORAGE_KEY, '__REMOVED__');
      window.dispatchEvent(new CustomEvent('anubandh-groom-photo-changed', { detail: null }));
    } catch (e) {
      console.warn('LocalStorage removal error:', e);
    }
  }

  clearBiodataCanvasCache();

  try {
    const groomRef = ref(rtdb, RTDB_PATH);
    await set(groomRef, {
      photo: '__REMOVED__',
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
      const remotePhoto = val.photo;
      if (remotePhoto === '__REMOVED__' || remotePhoto === null || remotePhoto === '') {
        try {
          localStorage.setItem(STORAGE_KEY, '__REMOVED__');
        } catch {
          // ignore
        }
        clearBiodataCanvasCache();
        callback(null);
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, remotePhoto);
        } catch {
          // ignore
        }
        clearBiodataCanvasCache();
        callback(remotePhoto);
      }
    } else {
      // If cloud is empty and local was not explicitly removed, initialize cloud with default photo
      const local = getCachedGroomPhoto();
      if (local && local !== '__REMOVED__') {
        set(groomRef, {
          photo: local,
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

/**
 * Downloads the groom photo directly as Shubham-Kharche-Photo.jpg
 * Handles both base64 data URLs and remote Google Drive CDN URLs
 */
export async function downloadGroomPhotoImage(photoUrl: string, filename = 'Shubham-Kharche-Photo.jpg'): Promise<void> {
  if (photoUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Remote URL: attempt fetch to blob for true browser download dialog
  try {
    const response = await fetch(photoUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return;
    }
  } catch (e) {
    console.warn('Direct fetch download failed (falling back to direct anchor):', e);
  }

  // Fallback anchor
  const a = document.createElement('a');
  a.href = photoUrl;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Shares the groom photo using Web Share API if supported
 */
export async function shareGroomPhotoImage(photoDataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(photoDataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'Shubham-Kharche-Photo.jpg', { type: blob.type || 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'चि. शुभम अनिल खर्चे - वर फोटो',
        text: 'चि. शुभम अनिल खर्चे यांचा फोटो'
      });
      return true;
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return false;
    console.warn('Share photo error:', e);
  }
  return false;
}
