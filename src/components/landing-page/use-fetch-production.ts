import { useEffect, useState } from "react";
import { API } from "../../api/api";
import { TProduction } from "../production-line/types";

type TUseFetchProduction = (id: number | null) => {
  production: TProduction | null;
  error: Error | null;
};

export const useFetchProduction: TUseFetchProduction = (id) => {
  const [production, setProduction] = useState<TProduction | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;

    if (id) {
      API.fetchProduction(id)
        .then((p) => {
          if (aborted) return;

          setError(null);

          setProduction(p);
        })
        .catch((e) => {
          setProduction(null);

          setError(e);
        });
    } else {
      setProduction(null);
    }

    return () => {
      aborted = true;
    };
  }, [id]);

  return {
    error,
    production,
  };
};
