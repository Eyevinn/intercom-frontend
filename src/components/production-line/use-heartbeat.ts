import { useEffect } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";

type TProps = { sessionId: string | null };

export const useHeartbeat = ({ sessionId }: TProps) => {
  useEffect(() => {
    if (!sessionId) return noop;

    const interval = window.setInterval(() => {
      API.heartbeat({ sessionId }).catch(logger.red);
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId]);
};
