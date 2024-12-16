import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { CreateProduction } from "./create-production";

export const CreateProductionPage = ({
  setApiError,
}: {
  setApiError: () => void;
}) => {
  const [{ apiError }] = useGlobalState();

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  return <CreateProduction />;
};
