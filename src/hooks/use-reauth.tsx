import { useCallback, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { API } from "../api/api";

// Set up automatic token refresh every hour
export const useSetupTokenRefresh = () => {
  const [, dispatch] = useGlobalState();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setupTokenRefresh = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Function to call reauthenticate
    const reauth =  () => {
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
      }

    // Call reauthenticate immediately when entering the app to renew the cookie if it's valid
    reauth();

    // Set up interval to call reauthenticate every hour
    intervalRef.current = setInterval(
     reauth,
      60 * 60 * 1000
    );

    // Clean up interval when unmounting
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch]);

  return { setupTokenRefresh };
};
