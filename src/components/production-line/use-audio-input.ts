import { useEffect, useState } from "react";
import { noop } from "../../helpers";

type TGetMediaDevicesOptions = {
  inputId: string | null;
};

// A hook for fetching the user selected audio input as a MediaStream
export const useAudioInput = ({
  inputId,
}: TGetMediaDevicesOptions): MediaStream | null => {
  const [audioInput, setAudioInput] = useState<MediaStream | null>(null);

  useEffect(() => {
    let aborted = false;

    if (!inputId) return noop;

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

        setAudioInput(stream);
      });

    return () => {
      aborted = true;
    };
  }, [inputId]);

  return audioInput;
};
