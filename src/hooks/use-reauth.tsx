import { useCallback, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { API } from "../api/api";

// Set up automatic token refresh every hour
export const useSetupTokenRefresh = () => {
  const [, dispatch] = useGlobalState();
  const intervalRef = useRef<NodeJS.Timeout>();

  const setupTokenRefresh = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(
      () => {
        API.reauth().catch((error) => {
          const is500Error = error.message.includes("500");

          if (is500Error) {
            // Don't dispatch 500 errors as they're expected when inital OSC token expires
            return;
          }

          dispatch({
            type: "ERROR",
            payload: {
              error: new Error(`Failed to reauth: ${error}`),
            },
          });
        });
      },
      60 * 60 * 1000
    );

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [dispatch]);

  return { setupTokenRefresh };
};
