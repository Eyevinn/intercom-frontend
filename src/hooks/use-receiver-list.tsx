import { useEffect, useState } from "react";
import { API, TSavedReceiver } from "../api/api";

export const useListReceivers = (enabled: boolean = true) => {
  const [receivers, setReceivers] = useState<TSavedReceiver[]>([]);
  const [intervalLoad, setIntervalLoad] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) return undefined;

    let aborted = false;
    setError(null);

    API.fetchReceiverList()
      .then((result) => {
        if (aborted) return;
        setReceivers(result);
        setError(null);
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e : new Error("Failed to fetch receivers")
        );
      });

    return () => {
      aborted = true;
    };
  }, [intervalLoad, enabled]);

  const refresh = async () => {
    try {
      const result = await API.fetchReceiverList();
      setReceivers(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch receivers"));
    }
  };

  return {
    receivers,
    error,
    setIntervalLoad,
    refresh,
  };
};
