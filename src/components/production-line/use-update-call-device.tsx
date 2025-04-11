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
    if (!isBrowserFirefox) {
      const audioInputTheSame =
        joinProductionOptions?.audioinput === userSettings?.audioinput;
      const audioOutputTheSame = audiooutput === userSettings?.audiooutput;
      const payload = {
        joinProductionOptions: {
          productionId: joinProductionOptions?.productionId,
          lineId: joinProductionOptions?.lineId,
          username: joinProductionOptions?.username,
          audioinput: userSettings?.audioinput,
          lineUsedForProgramOutput:
            joinProductionOptions?.lineUsedForProgramOutput,
          isProgramUser: joinProductionOptions?.isProgramUser,
        },
        audiooutput: userSettings?.audiooutput || audiooutput,
      };

      // Check if all payload properties are defined
      const allPropertiesDefined = Object.values(
        payload.joinProductionOptions
      ).every((v) => v !== undefined);

      if ((!audioInputTheSame || !audioOutputTheSame) && audioElements) {
        if (audioInputTheSame && !audioOutputTheSame) {
          audioElements.forEach((audioElement) => {
            audioElement.setSinkId(payload.audiooutput || "");
          });
          dispatch({
            type: "UPDATE_CALL",
            payload: {
              id,
              updates: {
                audiooutput: payload.audiooutput,
              },
            },
          });
        } else if (allPropertiesDefined) {
          setConnectionActive(false);
          resetAudioInput();
          muteInput(true);

          // Create a non-nullable version of the payload for TypeScript
          const safePayload = {
            productionId: payload.joinProductionOptions.productionId!,
            lineId: payload.joinProductionOptions.lineId!,
            username: payload.joinProductionOptions.username!,
            audioinput: payload.joinProductionOptions.audioinput!,
            lineUsedForProgramOutput:
              payload.joinProductionOptions.lineUsedForProgramOutput!,
            isProgramUser: payload.joinProductionOptions.isProgramUser!,
          };

          dispatch({
            type: "UPDATE_CALL",
            payload: {
              id,
              updates: {
                joinProductionOptions: safePayload,
                audiooutput: payload.audiooutput,
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
