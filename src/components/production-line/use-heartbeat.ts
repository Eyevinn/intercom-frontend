import { useEffect, useRef } from "react";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import logger from "../../utils/logger.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { backoffDelayMs } from "../../utils/backoff.ts";
import { authCircuitBreaker } from "../../api/auth-circuit-breaker.ts";

// ok          - the manager acknowledged the heartbeat.
// unreachable - the manager could not be reached (network error / 5xx), e.g.
//               while it restarts. The loop keeps retrying with backoff.
// lost        - the manager is up but no longer knows the session (404/410).
//               The loop stops; the session has to be re-established.
export type THeartbeatStatus = "ok" | "unreachable" | "lost";

type TProps = {
  sessionId: string | null;
  onStatusChange?: (status: THeartbeatStatus) => void;
};

const isSessionGone = (status: number | undefined) =>
  status === 404 || status === 410;

const isManagerUnreachable = (status: number | undefined) =>
  status === undefined || status === 429 || status >= 500;

// Normal cadence between heartbeats while the session is healthy.
const HEARTBEAT_INTERVAL_MS = 10_000;

export const useHeartbeat = ({ sessionId, onStatusChange }: TProps) => {
  const [, dispatch] = useGlobalState();
  // Kept in a ref so a new callback identity never restarts the loop.
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!sessionId) return noop;

    let cancelled = false;
    let failure401Count = 0;
    let consecutiveFailureCount = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let resumeUnsub: (() => void) | null = null;

    const schedule = (delay: number) => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      timeout = setTimeout(tick, delay);
    };

    // When the auth circuit breaker is not healthy (a coordinated reauth is in
    // flight, or it has tripped open and is retrying on backoff), wait for it to
    // resume rather than firing (and failing) more heartbeats. The breaker is
    // the primary 401 coordinator now, so pausing here keeps the active-call
    // heartbeat alive across a transient outage instead of racking up the local
    // failure401Count — that path still exists as a backstop but normally the
    // breaker pauses this loop before three 401s can accumulate. On resume the
    // counters are reset so a coordinated reauth does not count against us.
    const waitForResume = () => {
      if (resumeUnsub) return; // already waiting
      resumeUnsub = authCircuitBreaker.subscribe(() => {
        if (cancelled || !authCircuitBreaker.isActive()) return;
        resumeUnsub?.();
        resumeUnsub = null;
        failure401Count = 0;
        consecutiveFailureCount = 0;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        tick();
      });
    };

    // Self-scheduling loop (rather than a fixed setInterval) so that a failing
    // endpoint is retried with exponential backoff instead of a steady 10s
    // stream of requests, and normal cadence resumes on the first success.
    const tick = () => {
      if (cancelled) return;
      // Respect the global auth circuit breaker: while it is reauthing or open
      // (retrying), pause this loop and resume once it recovers to healthy. The
      // breaker is not terminal, so we never stop the heartbeat for good here.
      if (!authCircuitBreaker.isActive()) {
        waitForResume();
        return;
      }
      API.heartbeat({ sessionId })
        .then(() => {
          if (cancelled) return;
          failure401Count = 0;
          consecutiveFailureCount = 0;
          onStatusChangeRef.current?.("ok");
          schedule(HEARTBEAT_INTERVAL_MS);
        })
        .catch((err) => {
          if (cancelled) return;
          if (isSessionGone(err.status)) {
            logger.red(
              `Session ${sessionId} is no longer known by the server.`
            );
            onStatusChangeRef.current?.("lost");
            return; // stop the loop — the session must be re-established
          }
          consecutiveFailureCount += 1;
          if (isManagerUnreachable(err.status)) {
            onStatusChangeRef.current?.("unreachable");
          }
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
      resumeUnsub?.();
    };
  }, [sessionId, dispatch]);
};
