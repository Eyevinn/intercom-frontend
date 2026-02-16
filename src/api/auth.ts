/**
 * Auth/Token Management for Intercom 2
 *
 * - JWT token stored in memory (not localStorage — tokens are sensitive)
 * - clientId stored in localStorage (persistent ID per decision D2)
 */

const CLIENT_ID_STORAGE_KEY = "intercom2-client-id";

let currentToken: string | null = null;

export type TClientRegistration = {
  clientId: string;
  token: string;
  name: string;
  role: string;
  location: string;
};

/**
 * Decode a JWT payload without verification.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(
  token: string
): { exp?: number; clientId?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Get the current JWT token.
 */
export function getToken(): string | null {
  return currentToken;
}

/**
 * Get the persistent clientId from localStorage.
 */
export function getClientId(): string | null {
  try {
    return localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store auth credentials after successful registration.
 */
export function setAuth(token: string, clientId: string): void {
  currentToken = token;
  try {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

/**
 * Clear the JWT token (on logout or expiry).
 * Does NOT clear clientId — that persists across sessions.
 */
export function clearAuth(): void {
  currentToken = null;
}

/**
 * Check if we have a valid (non-expired) token.
 * Decodes the JWT without verifying the signature.
 */
export function isAuthenticated(): boolean {
  if (!currentToken) return false;

  const payload = decodeJwtPayload(currentToken);
  if (!payload || !payload.exp) return false;

  // exp is in seconds, Date.now() in ms
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowSeconds;
}

/**
 * Get existingClientId for re-registration.
 * Only returns clientId if we have a token in memory (same session/tab reload).
 * Returns null for fresh tabs (even if localStorage has a clientId from another tab).
 */
export function getExistingClientIdForRegistration(): string | null {
  if (currentToken !== null) {
    return getClientId();
  }
  return null;
}
