import { useCallback, useEffect, useState } from "react";
import { noop } from "../../helpers";
import { TJoinProductionOptions } from "./types.ts";

type TGetMediaDevicesOptions = {
  audioInputId: TJoinProductionOptions["audioinput"] | null;
  audioOutputId: TJoinProductionOptions["audiooutput"] | null;
};

export type TUseAudioInputValues = MediaStream | "no-device" | null;

type TUseAudioInput = (
  options: TGetMediaDevicesOptions
) => [TUseAudioInputValues, () => void];

// A hook for fetching the user selected audio input as a MediaStream
export const useAudioInput: TUseAudioInput = ({
  audioInputId,
  audioOutputId,
}) => {
  const [audioInput, setAudioInput] = useState<TUseAudioInputValues>(null);

  useEffect(() => {
    let aborted = false;

    if (!audioInputId) return noop;

    if (audioInputId === "no-device") return setAudioInput("no-device");

    // First request a generic audio stream to "reset" permissions
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      // Then request the specific audio input the user has selected
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: {
              exact: audioInputId,
            },
            noiseSuppression: true,
          },
        })
        .then((stream) => {
          if (aborted) return;

          // Default to muted input
          stream.getTracks().forEach((t) => {
            // eslint-disable-next-line no-param-reassign
            t.enabled = false;
          });

          setAudioInput(stream);
        });
    });

    return () => {
      aborted = true;
    };
    // audioOutputId is needed as a dependency to trigger restart of
    // useEffect if only output has been updated during line-call
  }, [audioInputId, audioOutputId]);

  // Reset function to set audioInput to null
  const reset = useCallback(() => {
    if (audioInput && audioInput !== "no-device") {
      audioInput.getTracks().forEach((t) => t.stop());
    }
    setAudioInput(null);
  }, [audioInput]);

  return [audioInput, reset];
};
