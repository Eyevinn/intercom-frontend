import { useState } from "react";
import { API, TPatchReceiver, TSavedReceiver } from "../api/api";

export const useUpdateReceiver = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateReceiver = async (
    data: TPatchReceiver
  ): Promise<TSavedReceiver | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedReceiver = await API.updateReceiver(data);
      setSuccess(true);
      return updatedReceiver;
    } catch (e: unknown) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateReceiver, loading, success, error };
};
