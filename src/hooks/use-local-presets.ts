import { useSyncExternalStore, useCallback } from "react";
import { TPreset, TPresetCall } from "../api/api";

const STORAGE_KEY = "openintercom:local-presets";

// Module-level subscriber list — all hook instances share one store
let listeners: Array<() => void> = [];

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const readStorage = (): string => localStorage.getItem(STORAGE_KEY) ?? "[]";

const getSnapshot = () => readStorage();

const notifyListeners = () => listeners.forEach((fn) => fn());

const loadPresets = (): TPreset[] => {
  try {
    return (JSON.parse(readStorage()) as TPreset[]).map((g) => ({
      ...g,
      isLocal: true,
    }));
  } catch {
    return [];
  }
};

const savePresets = (presets: TPreset[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  notifyListeners();
};

export const useLocalPresets = () => {
  // Re-renders whenever notifyListeners() is called
  useSyncExternalStore(subscribe, getSnapshot);

  const presets = loadPresets();

  const createPreset = useCallback(
    (name: string, calls: TPresetCall[], companionUrl?: string) => {
      const newPreset: TPreset = {
        _id: `local_${crypto.randomUUID()}`,
        name,
        calls,
        createdAt: new Date().toISOString(),
        isLocal: true,
        ...(companionUrl ? { companionUrl } : {}),
      };
      savePresets([...loadPresets(), newPreset]);
    },
    []
  );

  const updatePreset = useCallback(
    (
      id: string,
      update: {
        name?: string;
        calls?: TPresetCall[];
        companionUrl?: string | null;
      }
    ) => {
      const { companionUrl, ...rest } = update;
      const normalized = {
        ...rest,
        ...(companionUrl !== undefined
          ? { companionUrl: companionUrl ?? undefined }
          : {}),
      };
      savePresets(
        loadPresets().map((g) =>
          // eslint-disable-next-line no-underscore-dangle
          g._id === id ? { ...g, ...normalized, isLocal: true } : g
        )
      );
    },
    []
  );

  const deletePreset = useCallback((id: string) => {
    // eslint-disable-next-line no-underscore-dangle
    savePresets(loadPresets().filter((g) => g._id !== id));
  }, []);

  return { presets, createPreset, updatePreset, deletePreset };
};
