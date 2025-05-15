import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API } from "../../api/api";

export const useEditLineName = (
  params: {
    productionId: string;
    lineId: string;
    name: string;
  } | null
) => {
  const [successfullEdit, setSuccessfullEdit] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullEdit(false);
    setLoading(true);
    if (params?.productionId && params?.lineId && params?.name) {
      API.updateLineName({
        productionId: params.productionId,
        lineId: params.lineId,
        name: params.name,
      })
        .then(() => {
          if (aborted) return;

          setSuccessfullEdit(true);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          dispatch({
            type: "ERROR",
            payload: {
              error:
                err instanceof Error
                  ? err
                  : new Error("Failed to delete production"),
            },
          });
          setError(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      aborted = true;
    };
  }, [dispatch, params]);

  return {
    loading,
    error,
    successfullEdit,
  };
};
