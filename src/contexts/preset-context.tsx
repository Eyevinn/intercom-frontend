import { createContext, useContext, ReactNode } from "react";
import { usePresets } from "../hooks/use-presets";

type PresetContextValue = ReturnType<typeof usePresets>;

const PresetContext = createContext<PresetContextValue | null>(null);

export const PresetProvider = ({ children }: { children: ReactNode }) => {
  const value = usePresets();
  return (
    <PresetContext.Provider value={value}>{children}</PresetContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePresetContext = (): PresetContextValue => {
  const ctx = useContext(PresetContext);
  if (!ctx)
    throw new Error("usePresetContext must be used within PresetProvider");
  return ctx;
};
