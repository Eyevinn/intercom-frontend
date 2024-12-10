import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TJoinProductionOptions } from "../production-line/types.ts";

// Navigates to a production line as soon as a new production is pushed to the global state
export const useNavigateToProduction = (
  joinProductionOptions: TJoinProductionOptions | null
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (joinProductionOptions) {
      navigate(
        `/production-calls/production/${joinProductionOptions.productionId}/line/${joinProductionOptions.lineId}`
      );
    }
  }, [navigate, joinProductionOptions]);
};
