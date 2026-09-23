/**
 * When the app is built with the `AUTH` env var set to an OSC login URL and the
 * manager keeps returning HTTP 401 after the in-app reauth flow has already had
 * its chance to renew the session, navigate the browser to that login URL so the
 * user can (re)authenticate.
 *
 * This MUST be invoked only after reauth has been attempted and failed — never
 * from the low-level fetch handler, otherwise the redirect would navigate away
 * before the reauth flow ever runs.
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

  // Loop guard: don't redirect if we are already on the auth destination.
  // Comparing origins (rather than the full href, which carries the app's own
  // path/query/hash and would essentially never equal the login URL) is the
  // actual terminating condition and cannot mis-fire on unrelated app URLs.
  try {
    const target = new URL(authUrl, window.location.href);
    if (target.origin === window.location.origin) return false;
  } catch {
    // Malformed AUTH url — nothing safe to navigate to.
    return false;
  }

  window.location.assign(authUrl);
  return true;
};
