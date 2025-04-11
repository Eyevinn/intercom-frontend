import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useCallsNavigation = ({
  isEmpty,
  paramProductionId,
  paramLineId,
}: {
  isEmpty: boolean;
  paramProductionId?: string;
  paramLineId?: string;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isEmpty && !paramProductionId && !paramLineId) {
      navigate("/");
    }
  }, [isEmpty, paramProductionId, paramLineId, navigate]);

  return navigate;
};
