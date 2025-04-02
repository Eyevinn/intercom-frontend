import { useState, useCallback, Dispatch } from "react";
import { TJoinProductionOptions } from "../components/production-line/types";
import { TUserSettings } from "../components/user-settings/types";
import { TGlobalStateAction } from "../global-state/global-state-actions";

export const useStartConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const startConnect = useCallback(
    ({
      payload,
      dispatch,
      userSettings,
    }: {
      payload: TJoinProductionOptions;
      dispatch: Dispatch<TGlobalStateAction>;
      userSettings: TUserSettings;
    }) => {
      setIsConnecting(true);
      const uuid = globalThis.crypto.randomUUID();

      dispatch({
        type: "ADD_CALL",
        payload: {
          id: uuid,
          callState: {
            joinProductionOptions: payload,
            audiooutput: userSettings?.audiooutput,
            mediaStreamInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            sessionId: null,
            dataChannel: null,
            isRemotelyMuted: false,
            hotkeys: {
              muteHotkey: "m",
              speakerHotkey: "n",
              pushToTalkHotkey: "t",
              increaseVolumeHotkey: "u",
              decreaseVolumeHotkey: "d",
              globalMuteHotkey: "p",
            },
          },
        },
      });
      dispatch({
        type: "SELECT_PRODUCTION_ID",
        payload: payload.productionId,
      });
      setIsConnecting(false);
    },
    []
  );

  return { loading: isConnecting, startConnect };
};
