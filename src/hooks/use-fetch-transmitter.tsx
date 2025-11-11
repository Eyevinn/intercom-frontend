import { useCallback, useEffect, useRef, useState } from "react";
import { API, TSavedTransmitter } from "../api/api";

type TUseFetchTransmitter = (id: string | null) => {
  transmitter: TSavedTransmitter | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
  setTransmitter: React.Dispatch<
    React.SetStateAction<TSavedTransmitter | null>
  >;
};

export const useFetchTransmitter: TUseFetchTransmitter = (id) => {
  const [transmitter, setTransmitter] = useState<TSavedTransmitter | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const abortedRef = useRef(false);

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!id) {
      setTransmitter(null);
      setLoading(false);
      return;
    }

    const localAbortedToken = { aborted: false };
    abortedRef.current = false;

    try {
      const t = await API.fetchTransmitter(id);
      if (abortedRef.current || localAbortedToken.aborted) return;
      setTransmitter(t);
    } catch (e: unknown) {
      if (abortedRef.current || localAbortedToken.aborted) return;
      setTransmitter(null);
      setError(e as Error);
    } finally {
      if (!abortedRef.current && !localAbortedToken.aborted) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    abortedRef.current = false;
    setTransmitter(null);
    doFetch();
    return () => {
      abortedRef.current = true;
    };
  }, [doFetch]);

  return {
    error,
    transmitter,
    loading,
    refetch: doFetch,
    setTransmitter,
  };
};
