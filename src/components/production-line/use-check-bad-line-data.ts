import { Dispatch, useEffect } from "react";
import { TJoinProductionOptions } from "./types.ts";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";

type TProps = {
  joinProductionOptions: TJoinProductionOptions | null;
  paramProductionId: string | undefined;
  paramLineId: string | undefined;
  callId: string;
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useCheckBadLineData = ({
  joinProductionOptions,
  paramProductionId,
  paramLineId,
  callId,
  dispatch,
}: TProps) => {
  useEffect(() => {
    if (!joinProductionOptions) {
      const pidIsNan = Number.isNaN(
        paramProductionId && parseInt(paramProductionId, 10)
      );

      const lidIsNan = Number.isNaN(paramLineId && parseInt(paramLineId, 10));

      if (pidIsNan || lidIsNan) {
        // Someone entered a production id in the URL that's not a number

        const errorString = `Bad URL. ${pidIsNan ? "Production ID is not a number." : ""} ${lidIsNan ? "Line ID is not a number." : ""}`;

        dispatch({
          type: "ERROR",
          payload: {
            callId,
            error: new Error(errorString),
          },
        });
      }
    }
  }, [paramProductionId, paramLineId, joinProductionOptions, dispatch, callId]);
};
