/**
 * Bridge between the React auth context and the plain `API` object.
 *
 * `API` is a module-level object, not a hook, so it cannot read the auth
 * context directly. The auth provider registers a getter here on every token
 * change and the request helpers read through it.
 */
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;

type TAccessTokenProvider = () => string | undefined;

let accessTokenProvider: TAccessTokenProvider | undefined;

export const setAccessTokenProvider = (
  provider: TAccessTokenProvider | undefined
) => {
  accessTokenProvider = provider;
};

export const getAccessToken = (): string | undefined => accessTokenProvider?.();

/**
 * Prefers the OIDC access token and falls back to the static API key, so a
 * build with OIDC disabled behaves exactly as before.
 */
export const authHeaders = (): Record<string, string> => {
  const token = getAccessToken();

  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  return API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};
};
