import { TFeatureFlags } from "../api/role-auth-store.ts";
import { getRequireAuth } from "../utils/runtime-config.ts";
import { useGlobalState } from "../global-state/context-provider.tsx";

// Roles feature (#633): React hook mirroring `hasFeature` from the role-auth
// store, but driven off global state so components re-render when a role is
// requested or cleared.
//
// Dormant by default: when no role is held the feature is reported as allowed,
// unless the deployment set REQUIRE_AUTH=true. When a role IS held the granted
// flag is authoritative.
export const useHasFeature = (feature: keyof TFeatureFlags): boolean => {
  const [{ roleAuth }] = useGlobalState();
  if (!roleAuth) return !getRequireAuth();
  return roleAuth.features[feature];
};
