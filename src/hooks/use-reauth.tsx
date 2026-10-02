import { useCallback, useEffect, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { API } from "../api/api";
import { maybeRedirectToAuth } from "../api/redirect-on-auth-failure";
import { authCircuitBreaker } from "../api/auth-circuit-breaker";

const REAUTH_MAX_ATTEMPTS = 3;
const REAUTH_RETRY_DELAY_MS = 3000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const attemptReauth = async (): Promise<Error | null> => {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < REAUTH_MAX_ATTEMPTS) {
    attempt += 1;
    try {
      // eslint-disable-next-line no-await-in-loop
      await API.reauth();
      return null;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const { status } = lastError as Error & { status?: number };
      const isNoOscTokenError =
        status === 404 ||
        status === 405 ||
        lastError.message.includes("404") ||
        lastError.message.includes("405");
      if (isNoOscTokenError) {
        // 404/405 means no OSC token is configured on this backend (the
        // manager returns 405 "No OSC_ACCESS_TOKEN set" now, older versions
        // returned 404) — this is a definitive signal, not a transient
        // failure, so don't burn the remaining attempts or sleeps
        return lastError;
      }
      if (attempt < REAUTH_MAX_ATTEMPTS) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(REAUTH_RETRY_DELAY_MS);
      }
    }
  }

  return lastError;
};

// Set up automatic token refresh every hour
export const useSetupTokenRefresh = () => {
  const [, dispatch] = useGlobalState();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setupTokenRefresh = useCallback(() => {
    // Skip reauth in local development — no OSC token service available
    if (import.meta.env.DEV) {
      return () => {};
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Function to call reauthenticate with retries
    const reauth = async () => {
      const lastError = await attemptReauth();

      if (lastError) {
        const { status } = lastError as Error & { status?: number };
        const is500Error = status === 500 || lastError.message.includes("500");
        if (is500Error) {
          // Don't dispatch 500 errors as they're expected when initial OSC token expires
          return;
        }
        const isNoOscTokenError =
          status === 404 ||
          status === 405 ||
          lastError.message.includes("404") ||
          lastError.message.includes("405");
        if (isNoOscTokenError) {
          // No OSC token configured on this backend (manager returns 405 now,
          // older versions returned 404) — stop trying permanently, no error
          // banner, no console noise
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }
        // Reauth has exhausted its retries. If a 401 persists and an OSC login
        // URL was configured (AUTH build-time var), redirect there so the user
        // can re-authenticate; otherwise fall through to the error banner.
        if (status === 401 && maybeRedirectToAuth(status)) {
          return;
        }
        const codePart = status != null ? status.toString() : "";
        dispatch({
          type: "ERROR",
          payload: {
            error: new Error(
              `Failed to reauth after ${REAUTH_MAX_ATTEMPTS} attempts - ${codePart}`
            ),
          },
        });
      }
    };

    // Call reauthenticate immediately when entering the app to renew the cookie if it's valid
    reauth();

    // Set up interval to call reauthenticate every hour
    intervalRef.current = setInterval(reauth, 60 * 60 * 1000);

    // Clean up interval when unmounting
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch]);

  return { setupTokenRefresh };
};

// Wires the global auth circuit breaker to the real reauth network call and to
// the global error state. Mount this once near the app root. When any API call
// returns 401, `handleFetchRequest` trips the breaker, which pauses all polling
// and runs this single coordinated reauth. On success every polling loop
// resumes; on failure the breaker opens, polling stops, and the error below is
// surfaced to the user (or the browser is redirected to the OSC login URL).
export const useAuthCircuitBreaker = () => {
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    authCircuitBreaker.configure({
      reauthRunner: async () => {
        const lastError = await attemptReauth();
        if (lastError) throw lastError;
      },
      onError: (error) => {
        const { status } = error as Error & { status?: number };

        // A persistent 401 after reauth exhausted its retries: redirect to the
        // configured OSC login URL if one exists; otherwise fall through.
        if (status === 401 && maybeRedirectToAuth(status)) {
          return;
        }

        // 500 is expected when the initial OSC token expires, and 404/405 mean
        // no OSC token is configured on this backend — neither should raise an
        // error banner (mirrors the hourly-refresh behaviour).
        const isSuppressed =
          status === 500 ||
          status === 404 ||
          status === 405 ||
          error.message.includes("500") ||
          error.message.includes("404") ||
          error.message.includes("405");
        if (isSuppressed) {
          return;
        }

        const codePart = status != null ? status.toString() : "";
        dispatch({
          type: "ERROR",
          payload: {
            error: new Error(
              `Failed to reauth after ${REAUTH_MAX_ATTEMPTS} attempts - ${codePart}`
            ),
          },
        });
      },
    });

    return () => {
      // Return the breaker to a healthy state so a remount starts clean.
      authCircuitBreaker.reset();
    };
  }, [dispatch]);
};
