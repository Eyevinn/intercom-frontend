import { useEffect } from "react";
import { isBrowserFirefox } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { TJoinProductionOptions } from "./types";

type TUpdateCallDevice = {
  id: string;
  joinProductionOptions: TJoinProductionOptions | null;
  audiooutput?: string;
  audioElements: HTMLAudioElement[] | null;
  resetAudioInput: () => void;
  setConnectionActive: (input: boolean) => void;
  muteInput: (input: boolean) => void;
};

export const useUpdateCallDevice = ({
  id,
  joinProductionOptions,
  audiooutput,
  audioElements,
  resetAudioInput,
  setConnectionActive,
  muteInput,
}: TUpdateCallDevice) => {
  const [{ userSettings }, dispatch] = useGlobalState();

  useEffect(() => {
    if (!isBrowserFirefox && joinProductionOptions && audioElements) {
      const audioInputTheSame =
        joinProductionOptions.audioinput === userSettings?.audioinput;
      const audioOutputTheSame = audiooutput === userSettings?.audiooutput;
      const newAudiooutput = userSettings?.audiooutput || audiooutput;

      if (audioInputTheSame && audioOutputTheSame) return;

      if (audioInputTheSame && !audioOutputTheSame) {
        audioElements.forEach((audioElement) => {
          audioElement.setSinkId(newAudiooutput || "");
        });
        dispatch({
          type: "UPDATE_CALL",
          payload: {
            id,
            updates: {
              audiooutput: newAudiooutput,
            },
          },
        });
      } else if (
        userSettings?.audioinput &&
        joinProductionOptions.productionId &&
        joinProductionOptions.lineId &&
        joinProductionOptions.username
      ) {
        setConnectionActive(false);
        resetAudioInput();
        muteInput(true);

        // Spread the existing joinProductionOptions to preserve all
        // fields (videoinput, videoEnabled, lineName, productionName)
        // — otherwise a mic change drops the video track on reconnect.
        const newJoinProductionOptions = {
          ...joinProductionOptions,
          audioinput: userSettings.audioinput,
        };

        dispatch({
          type: "UPDATE_CALL",
          payload: {
            id,
            updates: {
              joinProductionOptions: newJoinProductionOptions,
              audiooutput: newAudiooutput,
              mediaStreamInput: null,
              dominantSpeaker: null,
              audioLevelAboveThreshold: false,
              connectionState: null,
              audioElements: null,
              sessionId: null,
            },
          },
        });
      }
    }
  }, [
    audioElements,
    audiooutput,
    dispatch,
    id,
    joinProductionOptions,
    muteInput,
    resetAudioInput,
    setConnectionActive,
    userSettings?.audioinput,
    userSettings?.audiooutput,
  ]);
};
