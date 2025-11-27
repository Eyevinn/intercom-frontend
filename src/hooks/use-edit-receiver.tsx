import { useState } from "react";
import { API, TBridgeState } from "../api/api";

export const useToggleReceiver = (receiverId: string) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggle = async (currentState: TBridgeState) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const newState =
        currentState === TBridgeState.RUNNING
          ? TBridgeState.STOPPED
          : TBridgeState.RUNNING;

      await API.updateReceiverState({
        id: receiverId,
        state: newState,
      });
      setSuccess(true);
    } catch (e: unknown) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return { toggle, loading, success, error };
};
