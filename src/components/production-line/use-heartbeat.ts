import { useEffect } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";

type TProps = { sessionId: string | null };

export const useHeartbeat = ({ sessionId }: TProps) => {
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    let failure401Count = 0;
    if (!sessionId) return noop;

    const interval = window.setInterval(() => {
      API.heartbeat({ sessionId })
        .catch((err) => { 
          if (err.status === 401) {
            failure401Count++;
          };
          // Might want to add another dispatch here for other error codes. 
          logger.red(
            `Error sending heartbeat for session ${sessionId}.`
          );
          if (failure401Count >= 3) {
            dispatch({ 
              type: "HEARTBEAT_ERROR",
              payload: {
                sessionId: sessionId,
                error: new Error(
                  "Stopped heartbeat after 3 retries."
                ),
              },
            });
            window.clearInterval(interval);
            return;
          }
        });
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId]);
};
