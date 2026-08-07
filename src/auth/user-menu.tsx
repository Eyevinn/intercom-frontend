import styled from "@emotion/styled";
import { FC } from "react";
import { useAuth } from "react-oidc-context";
import { mediaQueries } from "../components/generic-components.ts";
import { oidcConfig } from "./oidc-settings.ts";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
  color: rgba(255, 255, 255, 0.87);
  font-size: 1.4rem;
`;

const UserName = styled.span`
  ${mediaQueries.isSmallScreen} {
    display: none;
  }
`;

const SignOutButton = styled.button`
  background: transparent;
  border: 0.1rem solid rgba(255, 255, 255, 0.4);
  border-radius: 0.4rem;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.87);
  font-size: 1.4rem;
  cursor: pointer;

  &:hover {
    border-color: rgba(255, 255, 255, 0.87);
  }
`;

const SignedInUser: FC = () => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return null;
  }

  const profile = auth.user?.profile;
  const displayName =
    profile?.preferred_username ?? profile?.name ?? profile?.email ?? "";

  return (
    <Wrapper>
      <UserName>{displayName}</UserName>
      <SignOutButton
        type="button"
        onClick={() => {
          // End the Keycloak session too, not just the local one — otherwise the
          // next sign-in silently reuses the old session.
          auth.signoutRedirect({
            post_logout_redirect_uri: oidcConfig.redirectUri,
          });
        }}
      >
        Sign out
      </SignOutButton>
    </Wrapper>
  );
};

/** Renders nothing when OIDC is disabled, so the header is unchanged. */
export const UserMenu: FC = () =>
  oidcConfig.enabled ? <SignedInUser /> : null;
