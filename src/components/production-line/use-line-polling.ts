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

export const useLinePolling = ({ callId, joinProductionOptions }: TProps) => {
  const [line, setLine] = useState<TLine | null>(null);
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    if (!joinProductionOptions) return noop;

    let consecutiveFailureCount = 0;
    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    // Surface an error to the user after this many consecutive failures, but
    // keep polling regardless — the backend may be briefly unavailable (e.g. a
    // MongoDB primary failover, which re-elects within ~10s). Stopping the
    // poll here used to leave the call permanently stuck until a manual reload;
    // instead we retry for the lifetime of the call and recover on our own.
    const ERROR_AFTER_FAILURES = 5;

    const interval = window.setInterval(() => {
      API.fetchProductionLine(productionId, lineId)
        .then((l) => {
          // Recovered after a sustained outage — clear the error banner so the
          // call returns to normal without the user having to rejoin.
          if (consecutiveFailureCount >= ERROR_AFTER_FAILURES) {
            dispatch({ type: "ERROR", payload: { callId, error: null } });
          }
          consecutiveFailureCount = 0;
          setLine(l);
        })
        .catch(() => {
          consecutiveFailureCount += 1;
          logger.red(
            `Error fetching production line ${productionId}/${lineId}. For call-id: ${callId}`
          );
          // Fire the error once, when we first cross the threshold — not every
          // tick — and never stop polling, so recovery is automatic.
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
        });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [callId, dispatch, joinProductionOptions]);

  return line;
};
