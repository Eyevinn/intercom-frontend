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

    const poll = async () => {
      if (cancelled) return;
      try {
        const participants = await API.fetchLineParticipants(
          productionId,
          lineId,
          controller.signal
        );
        if (cancelled) return;
        consecutiveFailureCount = 0;
        setLine((prev) => (prev ? { ...prev, participants } : prev));
      } catch (err) {
        if (cancelled || isAbortError(err)) return;
        if (!handleFailure()) return;
      }
      poll();
    };

    // Seed metadata (name, id, programOutputLine, ...) before long-polling —
    // the long-poll endpoint returns participants only.
    API.fetchProductionLine(productionId, lineId)
      .then((l) => {
        if (cancelled) return;
        consecutiveFailureCount = 0;
        setLine(l);
        poll();
      })
      .catch((err) => {
        if (cancelled || isAbortError(err)) return;
        if (handleFailure()) poll();
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [callId, dispatch, joinProductionOptions]);

  return line;
};
