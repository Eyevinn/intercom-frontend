import { useEffect, useState } from "react";
import { CallState } from "../../global-state/types";

export const useGlobalMuteHotkey = ({
  calls,
  initialHotkey,
}: {
  calls: Record<string, CallState>;
  initialHotkey: string;
}) => {
  const [customGlobalMute, setCustomGlobalMute] = useState(initialHotkey);

  useEffect(() => {
    const newGlobalMute = Object.values(calls).reduce((hotkey, callState) => {
      if (
        callState.hotkeys?.globalMuteHotkey &&
        callState.hotkeys.globalMuteHotkey !== hotkey
      ) {
        return callState.hotkeys.globalMuteHotkey;
      }
      return hotkey;
    }, customGlobalMute);

    if (newGlobalMute !== customGlobalMute) {
      setCustomGlobalMute(newGlobalMute);
    }
  }, [calls, customGlobalMute]);

  return customGlobalMute;
};
