import { useCallback, useState } from "react";
import { TUseAudioInputValues } from "./use-audio-input";
import { useGlobalState } from "../../global-state/context-provider";

export const useMuteInput = ({
  isProgramOutputLine,
  isProgramUser,
  inputAudioStream,
  id,
}: {
  isProgramOutputLine: boolean | null | undefined;
  isProgramUser: boolean | null | undefined;
  inputAudioStream: TUseAudioInputValues;
  id: string;
}) => {
  const [inputMute, setInputMute] = useState(true);
  const [, dispatch] = useGlobalState();

  const muteInput = useCallback(
    (mute: boolean) => {
      if (inputAudioStream && inputAudioStream !== "no-device") {
        inputAudioStream.getTracks().forEach((t) => {
          if (isProgramOutputLine && !isProgramUser) {
            // eslint-disable-next-line no-param-reassign
            t.enabled = false;
          } else {
            // eslint-disable-next-line no-param-reassign
            t.enabled = !mute;
          }
        });
        setInputMute(mute);
      }
      if (mute) {
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
    },
    [dispatch, id, inputAudioStream, isProgramOutputLine, isProgramUser]
  );
  return { muteInput, inputMute };
};
