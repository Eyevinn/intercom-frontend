import { useEffect, useState, useCallback } from "react";
import { API, TIngest } from "../../api/api";

export const useListIngest = () => {
  const [ingests, setIngests] = useState<TIngest[]>([]);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let aborted = false;
    setError(null);

    if (intervalLoad) {
      API.fetchIngestList()
        .then((result) => {
          if (aborted) return;
          setIngests(result.ingests);
          setIntervalLoad(false);
          setError(null);
        })
        .catch((e) => {
          setError(
            e instanceof Error ? e : new Error("Failed to fetch ingests")
          );
        });
    }

    return () => {
      aborted = true;
    };
  }, [intervalLoad]);

  const refresh = useCallback(() => setIntervalLoad(true), []);

  return {
    ingests,
    error,
    setIntervalLoad,
    refresh,
  };
};
