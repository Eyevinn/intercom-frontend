import { useCallback } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { API } from "../api/api";

// Set up automatic token refresh every hour
export const useSetupTokenRefresh = () => {
  const [, dispatch] = useGlobalState();

  const setupTokenRefresh = useCallback(() => {
    API.reauth().catch((error) => {
      dispatch({
        type: "ERROR",
        payload: error,
      });
    });

    const intervalId = setInterval(
      () => {
        API.reauth().catch((error) => {
          dispatch({
            type: "ERROR",
            payload: error,
          });
        });
      },
      60 * 60 * 1000
    );

    // Return cleanup function
    return () => clearInterval(intervalId);
  }, [dispatch]);

  return { setupTokenRefresh };
};
