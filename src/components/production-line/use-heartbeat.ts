import { useEffect } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";

type TProps = { sessionId: string | null };

export const useHeartbeat = ({ sessionId }: TProps) => {
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    if (!sessionId) return noop;

    let failure401Count = 0;
    const interval = window.setInterval(() => {
      API.heartbeat({ sessionId })
        .then(() => {
          failure401Count = 0; // resets after success
        })
        .catch((err) => {
          if (err.status === 401) {
            failure401Count += 1;
          }
          // Might want to add another dispatch here for other error codes.
          logger.red(`Error sending heartbeat for session ${sessionId}.`);
          if (failure401Count >= 3) {
            dispatch({
              type: "HEARTBEAT_ERROR",
              payload: {
                sessionId,
                error: new Error("Stopped heartbeat after 3 retries."),
              },
            });
            window.clearInterval(interval);
          }
        });
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId, dispatch]);
};
