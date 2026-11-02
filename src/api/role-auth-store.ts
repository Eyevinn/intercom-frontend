import { getRequireAuth } from "../utils/runtime-config.ts";

// Role-based auth store (Roles feature, #469).
//
// Holds the role password requested by the user plus the role and feature
// flags the manager granted in exchange for it. This module is intentionally
// framework-agnostic (no React) so the low-level API layer can read the
// Authorization header from it without an import cycle, and so non-React call
// sites (e.g. the production-call join gate) can consult the granted features.
//
// DORMANT BY DEFAULT: when no role password has been stored, `getAuthHeader`
// returns an empty object and `hasFeature` reports access as allowed (unless a
// deployment explicitly turns on REQUIRE_AUTH). Existing no-auth deployments —
// where nobody ever opens the role field — therefore behave exactly as before:
// no Authorization header is ever attached and nothing is gated.

export type TRole = "admin" | "editor" | "participant";

export type TFeatureFlags = {
  canCreateProduction: boolean;
  canEditProduction: boolean;
  canDeleteProduction: boolean;
  canManageLines: boolean;
  canRemoveParticipants: boolean;
  canManageIngests: boolean;
  canJoinLine: boolean;
};

// The granted role plus its feature flags — exactly the shape the manager
// returns from POST /api/v1/permissions and what the app keeps in global state.
export type TRoleAuth = {
  role: TRole;
  features: TFeatureFlags;
};

// Persisted shape also carries the password so the Authorization header can be
// rebuilt after a page reload. The password is NEVER copied into React global
// state — only `role` and `features` are.
type TStoredRoleAuth = TRoleAuth & {
  password: string;
};

const STORAGE_KEY = "intercom_role_auth";

// In-memory cache, hydrated lazily from localStorage on first access. `false`
// means "not yet read"; `null` means "read, nothing stored".
let cache: TStoredRoleAuth | null | false = false;

const readFromStorage = (): TStoredRoleAuth | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TStoredRoleAuth;
    if (
      parsed &&
      typeof parsed.password === "string" &&
      typeof parsed.role === "string" &&
      parsed.features &&
      typeof parsed.features === "object"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const getStored = (): TStoredRoleAuth | null => {
  if (cache === false) {
    cache = readFromStorage();
  }
  return cache;
};

/**
 * Persist the granted role + feature flags together with the password that
 * unlocked them. Subsequent manager requests attach the password as a Bearer
 * token until it is cleared.
 */
export const setRoleAuth = (stored: TStoredRoleAuth): void => {
  cache = stored;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable (private mode / quota) — the in-memory cache still
    // keeps the role active for the current session.
  }
};

/** Forget any stored role, returning the app to its default (no-role) state. */
export const clearRoleAuth = (): void => {
  cache = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — the cleared in-memory cache is authoritative.
  }
};

/** The granted role + features, or null when no role is held. */
export const getRoleAuth = (): TRoleAuth | null => {
  const stored = getStored();
  if (!stored) return null;
  return { role: stored.role, features: stored.features };
};

/**
 * Authorization header for manager requests. Returns an empty object when no
 * role password is stored, so `authorizedFetch` sends the request completely
 * unchanged — never a bogus header — keeping no-auth deployments dormant.
 */
export const getAuthHeader = (): Record<string, string> => {
  const stored = getStored();
  if (!stored) return {};
  return { Authorization: `Bearer ${stored.password}` };
};

/**
 * Whether the current user may use the given feature.
 *
 * - No role held: allowed, UNLESS the deployment set REQUIRE_AUTH=true (in
 *   which case a role must be requested first). This is the dormant-by-default
 *   rule — guards and gates are transparent until a role enters the picture.
 * - Role held: strictly the flag the manager granted.
 */
export const hasFeature = (feature: keyof TFeatureFlags): boolean => {
  const auth = getRoleAuth();
  if (!auth) return !getRequireAuth();
  return auth.features[feature];
};

/** Test-only: wipe the in-memory cache between tests. */
export const resetRoleAuthForTests = (): void => {
  cache = false;
};
