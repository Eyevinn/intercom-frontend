import { useEffect, useState } from "react";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions, TLine } from "./types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import logger from "../../utils/logger.ts";

type TProps = {
  callId: string;
  joinProductionOptions: TJoinProductionOptions | null;
};

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === "AbortError";

// Exponential backoff between failed long-poll attempts so a persistently
// failing endpoint is not hammered with immediate retries.
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

const backoffDelayMs = (failureCount: number): number =>
  Math.min(BASE_BACKOFF_MS * 2 ** (failureCount - 1), MAX_BACKOFF_MS);

// Fetches the line once for its metadata, then keeps the participant list
// current through the manager's long-poll endpoint instead of interval polling:
// each request is held open server-side until participants change (or it times
// out), and is re-issued immediately when it resolves.
export const useLinePolling = ({ callId, joinProductionOptions }: TProps) => {
  const [line, setLine] = useState<TLine | null>(null);
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    if (!joinProductionOptions) return noop;

    let cancelled = false;
    let consecutiveFailureCount = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();
    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    const handleFailure = () => {
      consecutiveFailureCount += 1;
      logger.red(
        `Error fetching production line ${productionId}/${lineId}. For call-id: ${callId}`
      );
      if (consecutiveFailureCount >= 5) {
        dispatch({
          type: "ERROR",
          payload: {
            callId,
            error: new Error(
              `Could not fetch production line ${productionId}/${lineId}. For call-id: ${callId}`
            ),
          },
        });
      }
      if (consecutiveFailureCount >= 10) {
        dispatch({
          type: "ERROR",
          payload: {
            callId,
            error: new Error(
              "Line polling stopped after 10 consecutive failures."
            ),
          },
        });
        return false;
      }
      return true;
    };

    // Re-issue the long poll. On success it fires immediately (the request is
    // held open server-side, so this is not a busy loop); after a failure it
    // waits for an exponential backoff so a broken endpoint is not hot-looped.
    const poll = () => {
      if (cancelled) return;
      API.fetchLineParticipants(productionId, lineId, controller.signal)
        .then((participants) => {
          if (cancelled) return;
          consecutiveFailureCount = 0;
          setLine((prev) => (prev ? { ...prev, participants } : prev));
          poll();
        })
        .catch((err) => {
          if (cancelled || isAbortError(err)) return;
          if (handleFailure()) {
            retryTimeout = setTimeout(
              poll,
              backoffDelayMs(consecutiveFailureCount)
            );
          }
        });
    };

    // Seed metadata (name, id, programOutputLine, ...) before long-polling —
    // the long-poll endpoint returns participants only. Retries with the same
    // backoff as poll() so a failing endpoint is not hammered here either.
    const seed = () => {
      if (cancelled) return;
      API.fetchProductionLine(productionId, lineId)
        .then((l) => {
          if (cancelled) return;
          consecutiveFailureCount = 0;
          setLine(l);
          poll();
        })
        .catch((err) => {
          if (cancelled || isAbortError(err)) return;
          if (handleFailure()) {
            retryTimeout = setTimeout(
              seed,
              backoffDelayMs(consecutiveFailureCount)
            );
          }
        });
    };

    seed();

    return () => {
      cancelled = true;
      if (retryTimeout !== null) clearTimeout(retryTimeout);
      controller.abort();
    };
  }, [callId, dispatch, joinProductionOptions]);

  return line;
};
