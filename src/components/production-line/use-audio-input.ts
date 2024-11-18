import { useCallback, useEffect, useState } from "react";
import { noop } from "../../helpers";
import { TJoinProductionOptions } from "./types.ts";

type TGetMediaDevicesOptions = {
  inputId: TJoinProductionOptions["audioinput"] | null;
};

export type TUseAudioInputValues = MediaStream | "no-device" | null;

type TUseAudioInput = (
  options: TGetMediaDevicesOptions
) => [TUseAudioInputValues, () => void];

// A hook for fetching the user selected audio input as a MediaStream
export const useAudioInput: TUseAudioInput = ({ inputId }) => {
  const [audioInput, setAudioInput] = useState<TUseAudioInputValues>(null);

  useEffect(() => {
    let aborted = false;

    if (!inputId) return noop;

    if (inputId === "no-device") return setAudioInput("no-device");

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          deviceId: {
            exact: inputId,
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

    return () => {
      aborted = true;
    };
  }, [inputId]);

  // Reset function to set audioInput to null
  const reset = useCallback(() => {
    setAudioInput(null);
  }, []);

  return [audioInput, reset];
};
