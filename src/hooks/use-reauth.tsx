import { useCallback, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { API } from "../api/api";

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
