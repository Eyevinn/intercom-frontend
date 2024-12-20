import { useGlobalState } from "../../global-state/context-provider.tsx";
import { Hotkeys } from "./types.ts";

type TProps = {
  callId: string;
  hotkeys: Hotkeys;
};
export const useUpdateGlobalHotkey = () => {
  const [{ calls }, dispatch] = useGlobalState();

  const updateGlobalHotkey = ({ callId, hotkeys }: TProps) => {
    dispatch({
      type: "UPDATE_CALL",
      payload: {
        id: callId,
        updates: {
          hotkeys: { ...hotkeys },
        },
      },
    });
    Object.entries(calls).forEach(([id, callState]) => {
      if (id === callId) return;
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            hotkeys: {
              ...callState.hotkeys,
              globalMuteHotkey: hotkeys.globalMuteHotkey,
            },
          },
        },
      });
    });
  };

  return [updateGlobalHotkey];
};
