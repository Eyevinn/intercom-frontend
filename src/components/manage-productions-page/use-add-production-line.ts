import { useEffect, useState } from "react";
import { API } from "../../api/api";

type TUseAddProductionLine = (
  productionId: number | null,
  linesData: {
    lines: { name: string; programOutputLine: boolean }[];
  } | null
) => {
  loading: boolean;
  successfullCreate: boolean;
  error: Error | null;
};

export const useAddProductionLine: TUseAddProductionLine = (
  productionId,
  linesData
) => {
  const [successfullCreate, setSuccessfullCreate] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullCreate(false);
    setLoading(true);
    if (productionId && linesData?.lines.length) {
      API.addProductionLine(
        productionId,
        linesData.lines[0].name,
        linesData.lines[0].programOutputLine
      )
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
  }, [linesData, productionId]);

  return {
    loading,
    successfullCreate,
    error,
  };
};
