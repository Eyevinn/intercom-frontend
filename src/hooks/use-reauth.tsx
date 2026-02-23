import { useCallback, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { API } from "../api/api";

const REAUTH_MAX_ATTEMPTS = 3;
const REAUTH_RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Set up automatic token refresh every hour
export const useSetupTokenRefresh = () => {
  const [, dispatch] = useGlobalState();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setupTokenRefresh = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Function to call reauthenticate with retries
    const reauth = async () => {
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= REAUTH_MAX_ATTEMPTS; attempt++) {
        try {
          await API.reauth();
          return;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < REAUTH_MAX_ATTEMPTS) {
            await sleep(REAUTH_RETRY_DELAY_MS);
          }
        }
      }

      if (lastError) {
        const status = (lastError as Error & { status?: number }).status;
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
