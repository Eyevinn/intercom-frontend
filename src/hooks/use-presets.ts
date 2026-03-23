import { useState, useEffect, useCallback } from "react";
import { API, TPreset } from "../api/api";

export const usePresets = () => {
  const [presets, setPresets] = useState<TPreset[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.listPresets()
      .then((r) => setPresets(r.presets))
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    await API.deletePreset(id);
    // eslint-disable-next-line no-underscore-dangle
    setPresets((prev) => prev.filter((p) => p._id !== id));
  }, []);

  return { presets, error, loading, deletePreset };
};
