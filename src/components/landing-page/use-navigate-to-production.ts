import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";

// Navigates to a production line as soon as a new production is pushed to the global state
export const useNavigateToProduction = () => {
  const [{ joinProductionOptions }] = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    if (joinProductionOptions) {
      navigate(
        `/production/${joinProductionOptions.productionId}/line/${joinProductionOptions.lineId}`
      );
    }
  }, [navigate, joinProductionOptions]);
};
