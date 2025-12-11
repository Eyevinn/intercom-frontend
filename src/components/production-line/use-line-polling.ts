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

    let failure401Count = 0;
    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    const interval = window.setInterval(() => {
      API.fetchProductionLine(productionId, lineId)
        .then((l) => {
          failure401Count = 0;
          setLine(l);
        })
        .catch((err) => {
          if (err.status === 401) {
            failure401Count += 1;
          }
          // Might want to add another dispatch here for other error codes.
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
          if (failure401Count >= 10) {
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
