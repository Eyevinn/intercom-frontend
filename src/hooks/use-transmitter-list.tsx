import { useEffect, useState } from "react";
import { API, TSavedTransmitter } from "../api/api";

export const useListTransmitters = (enabled: boolean = true) => {
  const [transmitters, setTransmitters] = useState<TSavedTransmitter[]>([]);
  const [intervalLoad, setIntervalLoad] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) return undefined;

    let aborted = false;
    setError(null);

    API.fetchTransmitterList()
      .then((result) => {
        if (aborted) return;
        setTransmitters(result);
        setError(null);
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e : new Error("Failed to fetch transmitters")
        );
      });

    return () => {
      aborted = true;
    };
  }, [intervalLoad, enabled]);

  const refresh = async () => {
    try {
      const result = await API.fetchTransmitterList();
      setTransmitters(result);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Failed to fetch transmitters")
      );
    }
  };

  return {
    transmitters,
    error,
    setIntervalLoad,
    refresh,
  };
};
