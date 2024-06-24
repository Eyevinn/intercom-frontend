import { useEffect, useState } from "react";
import { API } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";

type TUseDeleteProduction = (
  productionId: number | null,
  lineId: number | null
) => {
  loading: boolean;
  successfullDelete: boolean;
};

export const useRemoveProductionLine: TUseDeleteProduction = (
  productionId,
  lineId
) => {
  const [successfullDelete, setSuccessfullDelete] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;
    setSuccessfullDelete(false);
    setLoading(true);
    if (productionId && lineId) {
      API.deleteProductionLine(productionId, lineId)
        .then(() => {
          if (aborted) return;

          setSuccessfullDelete(true);
          setLoading(false);
        })
        .catch((err) => {
          dispatch({
            type: "ERROR",
            payload:
              err instanceof Error
                ? err
                : new Error("Failed to delete production line"),
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      aborted = true;
    };
  }, [dispatch, lineId, productionId]);

  return {
    loading,
    successfullDelete,
  };
};
