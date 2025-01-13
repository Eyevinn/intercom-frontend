import { useEffect, useState } from "react";
import { API } from "../../api/api";

type TUseAddProductionLine = (
  productionId: string | null,
  line: { name: string; programOutputLine: boolean } | null
) => {
  loading: boolean;
  successfullCreate: boolean;
  error: Error | null;
};

export const useAddProductionLine: TUseAddProductionLine = (
  productionId,
  line
) => {
  const [successfullCreate, setSuccessfullCreate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullCreate(false);
    setLoading(true);
    if (productionId && line) {
      API.addProductionLine(productionId, line.name, line.programOutputLine)
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
  }, [line, productionId]);

  return {
    loading,
    successfullCreate,
    error,
  };
};
