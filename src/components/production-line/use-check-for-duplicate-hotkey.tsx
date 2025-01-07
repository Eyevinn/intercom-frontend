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

      hotkeysInGlobalState.forEach(([globalKey, globalValue]) => {
        hotkeysLocalState.forEach(([localKey, localValue]) => {
          // Skip comparison if both keys are "globalMuteHotkey"
          if (
            globalKey === "globalMuteHotkey" &&
            localKey === "globalMuteHotkey"
          ) {
            return;
          }

          // Add duplicate if values match
          if (globalValue === localValue) {
            newDuplicates.add(localValue);
          }
        });
      });
    });

    // Update state with unique duplicates
    setHotkeysDuplicate((prev) => {
      const updatedDuplicates = prev
        ? new Set([...prev, ...Array.from(newDuplicates)])
        : newDuplicates;
      return Array.from(updatedDuplicates);
    });
  }, [callId, calls, hotkeys]);

  return hotkeysDuplicate;
};
