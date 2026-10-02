import { useEffect, useState } from "react";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions, TLine } from "./types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import logger from "../../utils/logger.ts";
import { backoffDelayMs } from "../../utils/backoff.ts";

type TProps = {
  callId: string;
  joinProductionOptions: TJoinProductionOptions | null;
};

const LINE_METADATA_REFRESH_MS = 1000;

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === "AbortError";

// Keeps the participant list current through the manager's long-poll endpoint
// (each request is held open server-side until participants change, then is
// re-issued immediately), and refreshes the rest of the line on an interval
// since the long-poll does not carry line-level fields.
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
    const ERROR_AFTER_FAILURES = 5;

    const handleFailure = () => {
      consecutiveFailureCount += 1;
      logger.red(
        `Error fetching production line ${productionId}/${lineId}. For call-id: ${callId}`
      );
      if (consecutiveFailureCount === ERROR_AFTER_FAILURES) {
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
    };

    // Clear a previously surfaced polling error once a request succeeds again.
    const clearErrorOnRecovery = () => {
      if (consecutiveFailureCount >= ERROR_AFTER_FAILURES) {
        dispatch({ type: "ERROR", payload: { callId, error: null } });
      }
    };

    // Re-issue the long poll. On success it fires immediately (the request is
    // held open server-side, so this is not a busy loop); after a failure it
    // waits for an exponential backoff so a broken endpoint is not hot-looped.
    const poll = () => {
      if (cancelled) return;
      API.fetchLineParticipants(productionId, lineId, controller.signal)
        .then((participants) => {
          if (cancelled) return;
          clearErrorOnRecovery();
          consecutiveFailureCount = 0;
          setLine((prev) => (prev ? { ...prev, participants } : prev));
          poll();
        })
        .catch((err) => {
          if (cancelled || isAbortError(err)) return;
          handleFailure();
          retryTimeout = setTimeout(
            poll,
            backoffDelayMs(consecutiveFailureCount)
          );
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
          clearErrorOnRecovery();
          consecutiveFailureCount = 0;
          setLine(l);
          poll();
        })
        .catch((err) => {
          if (cancelled || isAbortError(err)) return;
          handleFailure();
          retryTimeout = setTimeout(
            seed,
            backoffDelayMs(consecutiveFailureCount)
          );
        });
    };

    const refreshLineMetadata = () => {
      API.fetchProductionLine(productionId, lineId)
        .then((l) => {
          if (cancelled) return;
          setLine((prev) =>
            prev ? { ...l, participants: prev.participants } : l
          );
        })
        .catch(() => {
          if (cancelled) return;
          logger.red(
            `Error refreshing line metadata ${productionId}/${lineId}. For call-id: ${callId}`
          );
        });
    };

    seed();
    const metadataInterval = window.setInterval(
      refreshLineMetadata,
      LINE_METADATA_REFRESH_MS
    );

    return () => {
      cancelled = true;
      window.clearInterval(metadataInterval);
      if (retryTimeout !== null) clearTimeout(retryTimeout);
      controller.abort();
    };
  }, [callId, dispatch, joinProductionOptions]);

  return line;
};
