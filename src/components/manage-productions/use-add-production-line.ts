import { useEffect, useState } from "react";
import { API } from "../../api/api";

type TUseAddProductionLine = (
  productionId: number | null,
  lineNames: {
    lines: { name: string }[];
  } | null
) => {
  loading: boolean;
  successfullCreate: boolean;
  error: Error | null;
};

export const useAddProductionLine: TUseAddProductionLine = (
  productionId,
  lineNames
) => {
  const [successfullCreate, setSuccessfullCreate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullCreate(false);
    setLoading(true);
    if (productionId && lineNames) {
      API.addProductionLine(productionId, lineNames.lines[0].name)
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
  }, [lineNames, productionId]);

  return {
    loading,
    successfullCreate,
    error,
  };
};
