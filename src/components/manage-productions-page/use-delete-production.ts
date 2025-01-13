import { useEffect, useState } from "react";
import { API } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";

type TUseDeleteProduction = (id: string | null) => {
  loading: boolean;
  error: Error | null;
  successfullDelete: boolean;
};

export const useDeleteProduction: TUseDeleteProduction = (id) => {
  const [successfullDelete, setSuccessfullDelete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;
    setError(null);
    setSuccessfullDelete(false);
    setLoading(true);
    if (id) {
      API.deleteProduction(id)
        .then(() => {
          if (aborted) return;

          setSuccessfullDelete(true);
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
  }, [dispatch, id]);

  return {
    loading,
    error,
    successfullDelete,
  };
};
