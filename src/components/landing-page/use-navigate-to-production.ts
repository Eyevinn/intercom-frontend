import { useEffect } from "react";
import { useNavigate } from "react-router";
import { buildCallsUrl } from "../../utils/call-url";
import { TJoinProductionOptions } from "../production-line/types.ts";

// Navigates to a production line as soon as a new production is pushed to the global state
export const useNavigateToProduction = (
  joinProductionOptions: TJoinProductionOptions | null
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (joinProductionOptions) {
      navigate(
        buildCallsUrl([
          {
            productionId: joinProductionOptions.productionId,
            lineId: joinProductionOptions.lineId,
          },
        ])
      );
    }
  }, [navigate, joinProductionOptions]);
};
