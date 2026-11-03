import { useEffect, useState } from "react";
import { API, TBasicProductionResponse } from "../../api/api";

type TUseFetchProduction = (id: number | null) => {
  production: TBasicProductionResponse | null;
  error: Error | null;
  loading: boolean;
};

export const useFetchProduction: TUseFetchProduction = (id) => {
  const [production, setProduction] = useState<TBasicProductionResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setProduction(null);

    if (id) {
      API.fetchProduction(id)
        .then((p) => {
          if (aborted) return;

          setError(null);
          setLoading(false);
          setProduction(p);
        })
        .catch((e) => {
          setProduction(null);
          setLoading(false);
          setError(e);
        });
    } else {
      setProduction(null);
      setLoading(false);
    }

    return () => {
      aborted = true;
    };
  }, [id]);

  return {
    error,
    production,
    loading,
  };
};
