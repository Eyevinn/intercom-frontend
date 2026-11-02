import { ReactNode } from "react";
import { Navigate } from "react-router";
import { TFeatureFlags } from "../../../api/role-auth-store.ts";
import { useHasFeature } from "../../../hooks/use-has-feature.ts";

type RequireFeatureProps = {
  feature: keyof TFeatureFlags;
  children: ReactNode;
};

/**
 * Route-level permission guard (Roles feature, #633).
 *
 * Renders its children only when the current user may use `feature`. The
 * decision comes from `useHasFeature`, so the behaviour is dormant by default:
 *
 *   - No role held + REQUIRE_AUTH off (default): access is allowed, exactly as
 *     before the Roles feature existed — existing no-auth deployments are never
 *     locked out.
 *   - No role held + REQUIRE_AUTH on: redirected to the landing page, where a
 *     role password can be entered in user settings.
 *   - Role held: access follows the granted flag; when denied the user is sent
 *     back to the landing page rather than seeing a broken restricted screen.
 */
export const RequireFeature = ({ feature, children }: RequireFeatureProps) => {
  const allowed = useHasFeature(feature);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};
