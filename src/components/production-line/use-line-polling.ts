import { useEffect, useState, useRef } from "react";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions, TLine } from "./types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import logger from "../../utils/logger.ts";

type TProps = {
  callId: string;
  joinProductionOptions: TJoinProductionOptions | null;
};

const MAX_CONSECUTIVE_401_ERRORS = 10;
const LINE_POLLING_INTERVAL = 1000;

export const useLinePolling = ({ callId, joinProductionOptions }: TProps) => {
  const [line, setLine] = useState<TLine | null>(null);
  const [, dispatch] = useGlobalState();
  const consecutive401ErrorsRef = useRef(0);
  const isPollingActiveRef = useRef(true);

  useEffect(() => {
    if (!joinProductionOptions) return noop;

    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    consecutive401ErrorsRef.current = 0;
    isPollingActiveRef.current = true;

    const performLinePolling = async () => {
      if (!isPollingActiveRef.current) {
        return;
      }

      try {
        const l = await API.fetchProductionLine(productionId, lineId);
        setLine(l);
        // Reset error counter on successful fetch
        consecutive401ErrorsRef.current = 0;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if this is a 401 unauthorized error
        if (errorMessage.includes("Response Code: 401")) {
          consecutive401ErrorsRef.current += 1;

          logger.red(`Line polling 401 error (${consecutive401ErrorsRef.current}/${MAX_CONSECUTIVE_401_ERRORS}): ${errorMessage}`);

          // Stop polling after max consecutive 401 errors
          if (consecutive401ErrorsRef.current >= MAX_CONSECUTIVE_401_ERRORS) {
            isPollingActiveRef.current = false;
            logger.red(`Line polling stopped after ${MAX_CONSECUTIVE_401_ERRORS} consecutive 401 errors. Reauthentication required.`);
            return;
          }
        } else {
          // Reset 401 counter for non-401 errors
          consecutive401ErrorsRef.current = 0;

          // Handle non-401 errors as before
          logger.red(
            `Error fetching production line ${productionId}/${lineId}. For call-id: ${callId}`
          );
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
      }
    };

    const interval = window.setInterval(performLinePolling, LINE_POLLING_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [callId, dispatch, joinProductionOptions]);

  return line;
};