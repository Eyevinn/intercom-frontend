import { useState } from "react";
import { API, TEditTransmitter, TBridgeState } from "../api/api";
import { useFetchTransmitter } from "./use-fetch-transmitter";

export const useToggleTransmitter = (id: string) => {
  const { transmitter, refetch, setTransmitter } = useFetchTransmitter(id);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggle = async () => {
    if (!transmitter) return;

    const next =
      transmitter.status === TBridgeState.RUNNING
        ? TBridgeState.STOPPED
        : TBridgeState.RUNNING;

    const prev = transmitter;
    setTransmitter((t) => (t ? { ...t, status: next } : t));

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: TEditTransmitter = { id, state: next };
      await API.updateTransmitterState(payload);
      setSuccess(true);
      await refetch();
    } catch (e: unknown) {
      setTransmitter(prev);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return { toggle, loading, success, error };
};
