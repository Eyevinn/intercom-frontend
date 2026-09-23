import { useState } from "react";
import { API, TPatchTransmitter, TSavedTransmitter } from "../api/api";

export const useUpdateTransmitter = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTransmitter = async (
    data: TPatchTransmitter
  ): Promise<TSavedTransmitter | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedTransmitter = await API.updateTransmitter(data);
      setSuccess(true);
      return updatedTransmitter;
    } catch (e: unknown) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateTransmitter, loading, success, error };
};
