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
    let failureCount = 0;
    if (!joinProductionOptions) return noop;

    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    const interval = window.setInterval(() => {
      API.fetchProductionLine(productionId, lineId)
        .then((l) => {
          failureCount = 0;
          setLine(l);
        })
        .catch(() => {
          // Maybe check specificallt for 401 error codes? Practically however, this would work the same.
          failureCount++;
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
          if (failureCount >= 10) {
            dispatch({
              type: "ERROR",
              payload: {
                callId,
                error: new Error("Line polling stopped after 10 retries."),
              },
            });
            window.clearInterval(interval);
          }
        });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [callId, dispatch, joinProductionOptions]);

  return line;
};
