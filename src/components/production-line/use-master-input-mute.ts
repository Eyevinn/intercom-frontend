import { useEffect, useRef } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions";

interface UseMasterInputMuteProps {
  inputAudioStream: MediaStream | "no-device" | null;
  isProgramOutputLine: boolean | null | undefined;
  masterInputMute: boolean;
  dispatch: React.Dispatch<TGlobalStateAction>;
  id: string;
  muteInput: (mute: boolean) => void;
}

export const useMasterInputMute = ({
  inputAudioStream,
  isProgramOutputLine,
  masterInputMute,
  dispatch,
  id,
  muteInput,
}: UseMasterInputMuteProps) => {
  const lastMutedRef = useRef<boolean | null>(null);
  useEffect(() => {
    const alreadySet = lastMutedRef.current === masterInputMute;

    if (
      inputAudioStream &&
      inputAudioStream !== "no-device" &&
      !isProgramOutputLine &&
      !alreadySet
    ) {
      lastMutedRef.current = masterInputMute;

      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !masterInputMute;
      });

      muteInput(masterInputMute);

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
    }
  }, [
    inputAudioStream,
    isProgramOutputLine,
    masterInputMute,
    muteInput,
    id,
    dispatch,
  ]);
};
