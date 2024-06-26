import { useEffect, useState } from "react";
import { API } from "../../api/api";

type TUseDeleteProductionLine = (
  productionId: number | null,
  lineId: number | null
) => {
  loading: boolean;
  successfullDelete: boolean;
  error: Error | null;
};

export const useRemoveProductionLine: TUseDeleteProductionLine = (
  productionId,
  lineId
) => {
  const [successfullDelete, setSuccessfullDelete] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullDelete(false);
    setLoading(true);
    if (productionId && lineId) {
      API.deleteProductionLine(productionId, lineId)
        .then(() => {
          if (aborted) return;

          setError(null);
          setSuccessfullDelete(true);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      aborted = true;
    };
  }, [lineId, productionId]);

  return {
    loading,
    successfullDelete,
    error,
  };
};
