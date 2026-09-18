/**
 * When the app is built with the `AUTH` env var set to an OSC login URL and the
 * manager returns HTTP 401 (token expired / not logged in), navigate the browser
 * to that login URL so the user can (re)authenticate.
 *
 * When `AUTH` is unset the function is a no-op and returns false, leaving the
 * existing OSC reauth flow unchanged.
 *
 * @returns true if a redirect was triggered, otherwise false.
 */
export const maybeRedirectToAuth = (status: number): boolean => {
  if (status !== 401) return false;

  const authUrl = import.meta.env.AUTH;
  if (typeof authUrl !== "string" || authUrl.length === 0) return false;

  // Guard against a redirect loop if we are already at the AUTH url.
  if (window.location.href === authUrl) return false;

  window.location.assign(authUrl);
  return true;
};
