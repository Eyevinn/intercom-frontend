import styled from "@emotion/styled";
import { ReactNode, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { DisplayWarning } from "../components/display-box.tsx";
import { PrimaryButton } from "../components/form-elements/form-elements.ts";
import {
  DisplayContainer,
  FlexContainer,
} from "../components/generic-components.ts";
import { LoaderDots } from "../components/loader/loader.tsx";
import { currentLocation, oidcConfig } from "./oidc-settings.ts";

const CenteredContainer = styled(FlexContainer)`
  justify-content: center;
  align-items: center;
  padding-top: 12rem;
`;

const ButtonWrapper = styled.div`
  margin: 2rem;
  display: flex;
  justify-content: center;
`;

const AuthGate = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  // Without this guard a redirect that comes back unauthenticated (declined
  // consent, misconfigured client) would bounce to Keycloak in a loop.
  const redirectAttempted = useRef(false);

  const { isLoading, isAuthenticated, activeNavigator, error, signinRedirect } =
    auth;

  useEffect(() => {
    if (
      isLoading ||
      isAuthenticated ||
      activeNavigator ||
      error ||
      redirectAttempted.current
    ) {
      return;
    }

    redirectAttempted.current = true;
    signinRedirect({ state: { returnTo: currentLocation() } });
  }, [isLoading, isAuthenticated, activeNavigator, error, signinRedirect]);

  if (error) {
    return (
      <CenteredContainer>
        <DisplayContainer>
          <DisplayWarning
            title="Sign in failed"
            text={`Could not sign in to ${oidcConfig.authority}: ${error.message}`}
          />
          <ButtonWrapper>
            <PrimaryButton
              type="button"
              onClick={() => {
                redirectAttempted.current = true;
                signinRedirect({ state: { returnTo: currentLocation() } });
              }}
            >
              Try again
            </PrimaryButton>
          </ButtonWrapper>
        </DisplayContainer>
      </CenteredContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <CenteredContainer>
        <LoaderDots className="auth-loader" text="Signing in" />
      </CenteredContainer>
    );
  }

  return children;
};

/**
 * Blocks the app until the user holds a valid Keycloak session. A plain
 * passthrough when OIDC is disabled.
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  if (!oidcConfig.enabled) {
    return children;
  }

  return <AuthGate>{children}</AuthGate>;
};
