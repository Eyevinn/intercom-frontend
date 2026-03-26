import { useState, useEffect, useCallback } from "react";
import { API, TPreset } from "../api/api";
import { useGlobalState } from "../global-state/context-provider";
import { useLocalPresets } from "./use-local-presets";

export const usePresets = () => {
  const [publicPresets, setPublicPresets] = useState<TPreset[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [{ reloadPresetList }, dispatch] = useGlobalState();

  const {
    presets: localPresets,
    createPreset: localCreatePreset,
    updatePreset: updateLocalPreset,
    deletePreset: deleteLocalPreset,
  } = useLocalPresets();

  useEffect(() => {
    API.listPresets()
      .then((r) => setPublicPresets(r.presets))
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!reloadPresetList) return;
    dispatch({ type: "PRESET_LIST_FETCHED" });
    API.listPresets()
      .then((r) => setPublicPresets(r.presets))
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))));
  }, [reloadPresetList, dispatch]);

  const presets: TPreset[] = [...localPresets, ...publicPresets];

  const deletePreset = useCallback(
    async (id: string) => {
      if (id.startsWith("local_")) {
        deleteLocalPreset(id);
      } else {
        await API.deletePreset(id);
        // eslint-disable-next-line no-underscore-dangle
        setPublicPresets((prev) => prev.filter((p) => p._id !== id));
      }
    },
    [deleteLocalPreset]
  );

  const updatePreset = useCallback(
    async (
      id: string,
      update: {
        name?: string;
        calls?: { productionId: string; lineId: string }[];
        companionUrl?: string | null;
      }
    ) => {
      if (id.startsWith("local_")) {
        updateLocalPreset(id, update);
      } else {
        const updated = await API.updatePreset(id, update);
        setPublicPresets((prev) =>
          // eslint-disable-next-line no-underscore-dangle
          prev.map((p) => (p._id === id ? updated : p))
        );
      }
    },
    [updateLocalPreset]
  );

  const createLocalPreset = useCallback(
    (
      name: string,
      calls: { productionId: string; lineId: string }[],
      companionUrl?: string
    ) => {
      localCreatePreset(name, calls, companionUrl);
    },
    [localCreatePreset]
  );

  const createPublicPreset = useCallback(
    async (options: {
      name: string;
      calls: {
        productionId: string;
        lineId: string;
        lineUsedForProgramOutput?: boolean;
        lineName?: string;
      }[];
      companionUrl?: string;
    }): Promise<void> => {
      await API.createPreset(options);
      dispatch({ type: "PRESET_UPDATED" });
    },
    [dispatch]
  );

  return {
    presets,
    error,
    loading,
    deletePreset,
    updatePreset,
    createLocalPreset,
    createPublicPreset,
  };
};
