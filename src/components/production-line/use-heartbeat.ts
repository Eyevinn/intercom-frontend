import { useEffect } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";

type TProps = { sessionId: string | null };

export const useHeartbeat = ({ sessionId }: TProps) => {
  useEffect(() => {
    if (!sessionId) return noop;

    const interval = window.setInterval(() => {
      API.heartbeat({ sessionId }).catch((error) => {
        logger.red(error);

        const is401Error = error.message.includes("401");
        if (is401Error) {
          window.clearInterval(interval);
        }
      });
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId]);
};
