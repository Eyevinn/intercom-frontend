import { useEffect, useState } from "react";
import { API } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";

type TUseDeleteProduction = (
  productionId: number | null,
  lineNames: {
    lines: { name: string }[];
  } | null
) => {
  loading: boolean;
  successfullCreate: boolean;
};

export const useAddProductionLine: TUseDeleteProduction = (
  productionId,
  lineNames
) => {
  const [successfullCreate, setSuccessfullCreate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;
    setSuccessfullCreate(false);
    setLoading(true);
    if (productionId && lineNames) {
      API.addProductionLine(productionId, lineNames.lines[0].name)
        .then(() => {
          if (aborted) return;

          setSuccessfullCreate(true);
          setLoading(false);
        })
        .catch((err) => {
          dispatch({
            type: "ERROR",
            payload:
              err instanceof Error
                ? err
                : new Error("Failed to create production line"),
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      aborted = true;
    };
  }, [dispatch, lineNames, productionId]);

  return {
    loading,
    successfullCreate,
  };
};
