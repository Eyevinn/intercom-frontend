import { useEffect } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";

type TProps = { sessionId: string | null };

export const useHeartbeat = ({ sessionId }: TProps) => {
  useEffect(() => {
    if (!sessionId) return noop;

    let failureCount = 0;
    const interval = window.setInterval(() => {
      API.heartbeat({ sessionId })
        .then(() => {
          failureCount = 0;
        })
        .catch(() => {
          failureCount += 1;
          if (failureCount >= 3) {
            logger.red(new Error("Heartbeat stopped after 3 retries."));
            window.clearInterval(interval);
          }
        });
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId]);
};
