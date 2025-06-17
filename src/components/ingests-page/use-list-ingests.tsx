import { useEffect, useState } from "react";
import { API, TSavedIngest } from "../../api/api";

export const useListIngest = () => {
  const [ingests, setIngests] = useState<TSavedIngest[]>([]);
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

  return {
    ingests,
    error,
    setIntervalLoad,
    refresh: () => setIntervalLoad(true),
  };
};
