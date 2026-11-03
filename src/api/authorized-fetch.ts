import { clearRoleAuth, getAuthHeader } from "./role-auth-store.ts";

/**
 * Thin `fetch` wrapper that attaches the role-based Authorization header to
 * manager API requests (Roles feature, #634).
 *
 * When no role password is stored, `getAuthHeader` returns an empty object and
 * this calls `fetch` with the exact same arguments it was given, so behaviour
 * is byte-for-byte identical to a bare `fetch` — the feature stays dormant for
 * deployments that hold no role. Only once a role password is stored is the
 * `Authorization: Bearer <role-password>` header merged in.
 */
export const authorizedFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const authHeader = getAuthHeader();

  if (Object.keys(authHeader).length === 0) {
    return fetch(input, init);
  }

  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      ...authHeader,
    },
  }).then((response) => {
    // The stored role password is no longer valid (rotated/removed): forget it
    // so the user is not left "signed in" with every request failing.
    if (response.status === 401) {
      clearRoleAuth();
    }
    return response;
  });
};
