import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";

// Navigates to a production line as soon as a new production is pushed to the global state
export const useNavigateToProduction = () => {
  const [{ production }] = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    if (production) {
      // TODO pick selected line id here
      navigate(`/production/${production.id}/line/1`);
    }
  }, [navigate, production]);
};
