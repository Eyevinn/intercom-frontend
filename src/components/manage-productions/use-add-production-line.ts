import { useEffect, useState } from "react";
import { API } from "../../api/api";

type TUseAddProductionLine = (
  productionId: number | null,
  lineName: string
) => {
  loading: boolean;
  successfullCreate: boolean;
  error: Error | null;
};

export const useAddProductionLine: TUseAddProductionLine = (
  productionId,
  lineName
) => {
  const [successfullCreate, setSuccessfullCreate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullCreate(false);
    setLoading(true);
    if (productionId && lineName) {
      API.addProductionLine(productionId, lineName)
        .then(() => {
          if (aborted) return;

          setError(null);
          setSuccessfullCreate(true);
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
  }, [lineName, productionId]);

  return {
    loading,
    successfullCreate,
    error,
  };
};
