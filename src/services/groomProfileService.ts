import { ref, set, onValue } from 'firebase/database';
import { rtdb } from './firebase';
import { clearBiodataCanvasCache } from '../utils/biodataCanvasGenerator';
import { DEFAULT_GROOM_PHOTO_CDN } from '../utils/googleDriveHelper';

const STORAGE_KEY_PHOTOS = 'anubandh_groom_photos_v2';
const STORAGE_KEY_LEGACY = 'anubandh_groom_photo_v1';
const RTDB_PATH = 'anubandh/groom_profile';

export interface GroomProfileCloudData {
  photo?: string | null;      // Legacy single photo
  photos?: string[] | null;   // Multiple photos
  updatedAt: number;
}

/**
 * Synchronously retrieves the cached array of groom photos for 0ms initial render.
 * Returns default Google Drive photo link in an array on fresh installs, or empty array if explicitly removed.
 */
export function getCachedGroomPhotos(): string[] {
  if (typeof window === 'undefined') return [DEFAULT_GROOM_PHOTO_CDN];
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (rawV2 === '__REMOVED__') {
      return [];
    }
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((p) => typeof p === 'string' && p.trim().length > 0);
        if (valid.length > 0) return valid;
      }
    }

    // Check legacy v1 key
    const rawV1 = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (rawV1 === '__REMOVED__') {
      return [];
    }
    if (rawV1 && rawV1.trim().length > 0) {
      return [rawV1.trim()];
    }

    return [DEFAULT_GROOM_PHOTO_CDN];
  } catch {
    return [DEFAULT_GROOM_PHOTO_CDN];
  }
}

/**
 * Synchronously retrieves the primary groom photo (index 0) or null
 */
export function getCachedGroomPhoto(): string | null {
  const list = getCachedGroomPhotos();
  return list.length > 0 ? list[0] : null;
}

/**
 * Saves all groom photos locally and syncs to Firebase Realtime Database
 */
export async function saveGroomPhotos(photos: string[]): Promise<void> {
  const updatedAt = Date.now();
  const cleaned = photos.filter((p) => typeof p === 'string' && p.trim().length > 0);

  // 1. Instant local persistence
  if (typeof window !== 'undefined') {
    try {
      if (cleaned.length === 0) {
        localStorage.setItem(STORAGE_KEY_PHOTOS, '__REMOVED__');
        localStorage.setItem(STORAGE_KEY_LEGACY, '__REMOVED__');
      } else {
        localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(cleaned));
        localStorage.setItem(STORAGE_KEY_LEGACY, cleaned[0]);
      }
      window.dispatchEvent(new CustomEvent('anubandh-groom-photos-changed', { detail: cleaned }));
      window.dispatchEvent(new CustomEvent('anubandh-groom-photo-changed', { detail: cleaned[0] || null }));
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
      photos: cleaned,
      photo: cleaned.length > 0 ? cleaned[0] : '__REMOVED__',
      updatedAt
    });
  } catch (err) {
    console.warn('Firebase RTDB groom photos sync error:', err);
  }
}

/**
 * Adds a new groom photo to the gallery
 */
export async function addGroomPhoto(photoUrl: string): Promise<void> {
  const trimmed = photoUrl.trim();
  if (!trimmed) return;
  const current = getCachedGroomPhotos();
  if (current.includes(trimmed)) return;
  const updated = [...current, trimmed];
  await saveGroomPhotos(updated);
}

/**
 * Removes a photo at a specific index
 */
export async function removeGroomPhotoAtIndex(index: number): Promise<void> {
  const current = getCachedGroomPhotos();
  if (index >= 0 && index < current.length) {
    const updated = current.filter((_, i) => i !== index);
    await saveGroomPhotos(updated);
  }
}

/**
 * Sets the photo at the specified index as the primary/cover photo (index 0)
 */
export async function setPrimaryGroomPhoto(index: number): Promise<void> {
  const current = getCachedGroomPhotos();
  if (index > 0 && index < current.length) {
    const target = current[index];
    const rest = current.filter((_, i) => i !== index);
    const updated = [target, ...rest];
    await saveGroomPhotos(updated);
  }
}

/**
 * Clears all photos from local storage and cloud database
 */
export async function clearAllGroomPhotos(): Promise<void> {
  await saveGroomPhotos([]);
}

/**
 * Backward compatibility: Saves a single groom photo
 */
export async function saveGroomPhoto(photoUrl: string): Promise<void> {
  await addGroomPhoto(photoUrl);
}

/**
 * Backward compatibility: Removes all groom photos
 */
export async function removeGroomPhoto(): Promise<void> {
  await clearAllGroomPhotos();
}

/**
 * Subscribes to full list of groom photos (both local tab events and Firebase cloud sync)
 */
export function subscribeGroomPhotos(callback: (photos: string[]) => void): () => void {
  // Initial callback with local cached value
  callback(getCachedGroomPhotos());

  const handleLocalChange = (e: any) => {
    callback(e.detail || []);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('anubandh-groom-photos-changed', handleLocalChange);
  }

  const groomRef = ref(rtdb, RTDB_PATH);
  const unsubscribeFirebase = onValue(groomRef, (snapshot) => {
    const val = snapshot.val() as GroomProfileCloudData | null;
    if (val !== undefined && val !== null) {
      let remotePhotos: string[] = [];
      if (Array.isArray(val.photos)) {
        remotePhotos = val.photos.filter((p) => typeof p === 'string' && p.trim().length > 0);
      } else if (val.photo && val.photo !== '__REMOVED__') {
        remotePhotos = [val.photo];
      }

      const isExplicitlyRemoved = val.photo === '__REMOVED__' || (Array.isArray(val.photos) && val.photos.length === 0);

      if (isExplicitlyRemoved) {
        try {
          localStorage.setItem(STORAGE_KEY_PHOTOS, '__REMOVED__');
          localStorage.setItem(STORAGE_KEY_LEGACY, '__REMOVED__');
        } catch {
          // ignore
        }
        clearBiodataCanvasCache();
        callback([]);
      } else if (remotePhotos.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(remotePhotos));
          localStorage.setItem(STORAGE_KEY_LEGACY, remotePhotos[0]);
        } catch {
          // ignore
        }
        clearBiodataCanvasCache();
        callback(remotePhotos);
      }
    } else {
      // Cloud is uninitialized, seed local
      const local = getCachedGroomPhotos();
      if (local.length > 0) {
        set(groomRef, {
          photos: local,
          photo: local[0],
          updatedAt: Date.now()
        }).catch(() => {});
      }
    }
  }, (err) => {
    console.warn('Firebase groom photos listener warning:', err);
  });

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('anubandh-groom-photos-changed', handleLocalChange);
    }
    unsubscribeFirebase();
  };
}

/**
 * Subscribes to primary groom photo updates
 */
export function subscribeGroomPhoto(callback: (photo: string | null) => void): () => void {
  return subscribeGroomPhotos((photos) => {
    callback(photos.length > 0 ? photos[0] : null);
  });
}

/**
 * Downloads a groom photo directly as Shubham-Kharche-Photo.jpg (or custom filename)
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
 * Shares a groom photo using Web Share API if supported
 */
export async function shareGroomPhotoImage(photoDataUrl: string, title = 'चि. शुभम अनिल खर्चे - वर फोटो'): Promise<boolean> {
  try {
    const res = await fetch(photoDataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'Shubham-Kharche-Photo.jpg', { type: blob.type || 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
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
