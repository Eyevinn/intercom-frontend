import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TJoinProductionOptions } from "../production-line/types.ts";
import { isMobile } from "../../bowser.ts";

// Navigates to a production line as soon as a new production is pushed to the global state
export const useNavigateToProduction = (
  joinProductionOptions: TJoinProductionOptions | null
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (joinProductionOptions && !isMobile) {
      navigate("/production-calls");
    } else if (joinProductionOptions && isMobile) {
      navigate(
        `/production-calls/production/${joinProductionOptions.productionId}/line/${joinProductionOptions.lineId}`
      );
    }
  }, [navigate, joinProductionOptions]);
};
