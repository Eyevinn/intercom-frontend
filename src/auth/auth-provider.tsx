import { ReactNode, useEffect } from "react";
import { AuthProvider as OidcAuthProvider, useAuth } from "react-oidc-context";
import { setAccessTokenProvider } from "./access-token.ts";
import {
  createUserManager,
  oidcConfig,
  onSigninCallback,
} from "./oidc-settings.ts";

/**
 * Keeps the module-level token getter used by `API` pointed at the current
 * access token. Re-registered whenever the token changes, so a silently renewed
 * token reaches the API layer without a reload.
 */
const AccessTokenBridge = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;

  useEffect(() => {
    setAccessTokenProvider(() => accessToken);

    return () => setAccessTokenProvider(undefined);
  }, [accessToken]);

  return children;
};

/**
 * Wraps the app in the OIDC context when Keycloak is configured, and is a plain
 * passthrough otherwise. `oidcConfig.enabled` is fixed at build time, so the
 * branch never flips at runtime and the hook order stays stable.
 */
// One UserManager for the app's lifetime: a second instance would run its own
// renewal timers against the same stored session.
const userManager = oidcConfig.enabled ? createUserManager(oidcConfig) : null;

export const IntercomAuthProvider = ({ children }: { children: ReactNode }) => {
  if (!userManager) {
    return children;
  }

  return (
    <OidcAuthProvider
      userManager={userManager}
      onSigninCallback={onSigninCallback}
    >
      <AccessTokenBridge>{children}</AccessTokenBridge>
    </OidcAuthProvider>
  );
};
