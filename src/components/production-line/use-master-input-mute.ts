import { useEffect } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions";

interface UseMasterInputMuteProps {
  inputAudioStream: MediaStream | "no-device" | null;
  isProgramOutputLine: boolean | null | undefined;
  masterInputMute: boolean;
  muteInput: (mute: boolean) => void;
  dispatch: React.Dispatch<TGlobalStateAction>;
  id: string;
}

export const useMasterInputMute = ({
  inputAudioStream,
  isProgramOutputLine,
  masterInputMute,
  muteInput,
  dispatch,
  id,
}: UseMasterInputMuteProps) => {
  useEffect(() => {
    if (
      inputAudioStream &&
      inputAudioStream !== "no-device" &&
      !isProgramOutputLine
    ) {
      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !masterInputMute;
      });
      muteInput(masterInputMute);
    }
    if (masterInputMute && !isProgramOutputLine) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            isRemotelyMuted: false,
          },
        },
      });
    }
  }, [
    dispatch,
    id,
    inputAudioStream,
    isProgramOutputLine,
    masterInputMute,
    muteInput,
  ]);
};
