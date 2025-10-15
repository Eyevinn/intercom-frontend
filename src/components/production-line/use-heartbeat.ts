import { useEffect, useRef } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";

type TProps = { sessionId: string | null };

const MAX_CONSECUTIVE_401_ERRORS = 10;
const HEARTBEAT_INTERVAL = 10_000;

export const useHeartbeat = ({ sessionId }: TProps) => {
  const consecutive401ErrorsRef = useRef(0);
  const isPollingActiveRef = useRef(true);

  useEffect(() => {
    if (!sessionId) return noop;

    consecutive401ErrorsRef.current = 0;
    isPollingActiveRef.current = true;

    const performHeartbeat = async () => {
      if (!isPollingActiveRef.current) {
        return;
      }

      try {
        await API.heartbeat({ sessionId });
        // Reset error counter on successful heartbeat
        consecutive401ErrorsRef.current = 0;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if this is a 401 unauthorized error
        if (errorMessage.includes("Response Code: 401")) {
          consecutive401ErrorsRef.current += 1;

          logger.red(`Heartbeat 401 error (${consecutive401ErrorsRef.current}/${MAX_CONSECUTIVE_401_ERRORS}): ${errorMessage}`);

          // Stop polling after max consecutive 401 errors
          if (consecutive401ErrorsRef.current >= MAX_CONSECUTIVE_401_ERRORS) {
            isPollingActiveRef.current = false;
            logger.red(`Heartbeat polling stopped after ${MAX_CONSECUTIVE_401_ERRORS} consecutive 401 errors. Reauthentication required.`);
            return;
          }
        } else {
          // Reset 401 counter for non-401 errors
          consecutive401ErrorsRef.current = 0;
          logger.red(errorMessage);
        }
      }
    };

    const interval = window.setInterval(performHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId]);

  // Provide a way to resume polling after successful reauthentication
  const resumeHeartbeatPolling = () => {
    consecutive401ErrorsRef.current = 0;
    isPollingActiveRef.current = true;
    logger.red("Heartbeat polling resumed after successful reauthentication");
  };

  return { resumeHeartbeatPolling };
};