import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { Hotkeys } from "./types.ts";

type TProps = {
  callId: string;
  hotkeys: Hotkeys;
};
export const useCheckForDuplicateHotkey = ({ callId, hotkeys }: TProps) => {
  const [hotkeysDuplicate, setHotkeysDuplicate] = useState<string[] | null>(
    null
  );
  const [{ calls }] = useGlobalState();

  useEffect(() => {
    if (!calls || !hotkeys || !callId) return;

    const newDuplicates = new Set<string>();

    Object.entries(calls).forEach(([id, callState]) => {
      if (id === callId) return; // Skip the current setup

      const hotkeysInGlobalState = Object.entries(callState.hotkeys);
      const hotkeysLocalState = Object.entries(hotkeys);

      hotkeysInGlobalState.forEach(([, globalValue]) => {
        hotkeysLocalState.forEach(([, localValue]) => {
          if (globalValue === localValue) {
            newDuplicates.add(localValue);
          }
        });
      });
    });

    setHotkeysDuplicate(Array.from(newDuplicates));
  }, [callId, calls, hotkeys]);

  return hotkeysDuplicate;
};
