/**
 * auth.ts - Security & Access Control for Anubandh
 * 
 * 1. Parent Access: 4-digit PIN (Valid for 7 days / 1 week)
 * 2. Admin Access: Password protected (Pipeline, Analytics, Candidate CRUD)
 * 3. Public Groom Profile: Free public access without PIN (isolated from portal)
 */

// Internal verification constants (never exposed to UI)
const PARENT_PIN_CODE = '2589';
const ADMIN_PASS_CODE = 'ekdant';

// 7 days in milliseconds: 7 * 24 * 60 * 60 * 1000
export const PARENT_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const PARENT_SESSION_KEY = 'anubandh_parent_auth_v1';
const ADMIN_SESSION_KEY = 'anubandh_admin_auth_v1';

interface ParentSessionData {
  timestamp: number;
  hash: string;
}

/**
 * Simple internal hash for session tamper protection
 */
function generateSessionHash(timestamp: number): string {
  const salt = 'anubandh_shubham_patrika_salt';
  let hash = 0;
  const str = `${timestamp}_${PARENT_PIN_CODE}_${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Checks if the parent PIN session is currently active and within the 7-day window
 */
export function isParentSessionValid(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(PARENT_SESSION_KEY);
    if (!stored) return false;

    const data: ParentSessionData = JSON.parse(stored);
    if (!data || !data.timestamp || !data.hash) return false;

    const now = Date.now();
    const elapsed = now - data.timestamp;

    // Check 7-day expiration
    if (elapsed < 0 || elapsed > PARENT_SESSION_DURATION_MS) {
      localStorage.removeItem(PARENT_SESSION_KEY);
      return false;
    }

    // Verify hash integrity
    return data.hash === generateSessionHash(data.timestamp);
  } catch (e) {
    console.error('Error verifying parent session:', e);
    return false;
  }
}

/**
 * Verifies entered PIN and starts a 7-day parent session on success
 */
export function authenticateParent(enteredPin: string): boolean {
  const cleanPin = String(enteredPin || '').trim();
  if (cleanPin === PARENT_PIN_CODE) {
    const timestamp = Date.now();
    const sessionData: ParentSessionData = {
      timestamp,
      hash: generateSessionHash(timestamp)
    };
    try {
      localStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(sessionData));
    } catch {
      // Storage fallback
    }
    return true;
  }
  return false;
}

/**
 * Logs out parent and clears local 7-day session
 */
export function logoutParent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PARENT_SESSION_KEY);
  }
}

/**
 * Checks if admin session is currently active
 */
export function isAdminSessionValid(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return stored === 'admin_authorized_ekdant';
  } catch {
    return false;
  }
}

/**
 * Verifies entered admin password and starts an admin session on success
 */
export function authenticateAdmin(enteredPassword: string): boolean {
  const cleanPass = String(enteredPassword || '').trim();
  if (cleanPass === ADMIN_PASS_CODE) {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'admin_authorized_ekdant');
    } catch {
      // Storage fallback
    }
    return true;
  }
  return false;
}

/**
 * Logs out admin and clears session
 */
export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
