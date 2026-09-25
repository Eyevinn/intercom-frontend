import { useEffect } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { backoffDelayMs } from "../../utils/backoff.ts";

type TProps = { sessionId: string | null };

// Normal cadence between heartbeats while the session is healthy.
const HEARTBEAT_INTERVAL_MS = 10_000;

export const useHeartbeat = ({ sessionId }: TProps) => {
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    if (!sessionId) return noop;

    let cancelled = false;
    let failure401Count = 0;
    let consecutiveFailureCount = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const schedule = (delay: number) => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      timeout = setTimeout(tick, delay);
    };

    // Self-scheduling loop (rather than a fixed setInterval) so that a failing
    // endpoint is retried with exponential backoff instead of a steady 10s
    // stream of requests, and normal cadence resumes on the first success.
    const tick = () => {
      API.heartbeat({ sessionId })
        .then(() => {
          if (cancelled) return;
          failure401Count = 0;
          consecutiveFailureCount = 0;
          schedule(HEARTBEAT_INTERVAL_MS);
        })
        .catch((err) => {
          if (cancelled) return;
          consecutiveFailureCount += 1;
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
            return; // stop the loop — do not reschedule
          }
          schedule(
            backoffDelayMs(consecutiveFailureCount, {
              baseMs: HEARTBEAT_INTERVAL_MS,
            })
          );
        });
    };

    schedule(HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timeout !== null) clearTimeout(timeout);
    };
  }, [sessionId, dispatch]);
};
