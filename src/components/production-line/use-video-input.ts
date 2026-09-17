import { Dispatch, useCallback, useEffect, useState } from "react";
import { noop } from "../../helpers";
import { TJoinProductionOptions } from "./types.ts";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";

type TGetVideoDeviceOptions = {
  videoInputId: TJoinProductionOptions["videoinput"] | null;
  dispatch: Dispatch<TGlobalStateAction>;
};

export type TUseVideoInputValues = MediaStream | "no-device" | null;

type TUseVideoInput = (
  options: TGetVideoDeviceOptions
) => [TUseVideoInputValues, boolean, () => void];

// A hook for fetching the user selected video input as a MediaStream
export const useVideoInput: TUseVideoInput = ({ videoInputId, dispatch }) => {
  const [videoInput, setVideoInput] = useState<TUseVideoInputValues>(null);
  const [videoInputError, setVideoInputError] = useState<boolean>(false);

  useEffect(() => {
    let aborted = false;

    if (videoInputId === null) {
      setVideoInput("no-device");
      return noop;
    }

    if (videoInputId === "no-device") {
      setVideoInput("no-device");
      return noop;
    }

    const qualityConstraints: MediaTrackConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 25 },
    };
    const videoConstraints: MediaTrackConstraints =
      videoInputId === ""
        ? qualityConstraints
        : { ...qualityConstraints, deviceId: { exact: videoInputId } };

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints })
      .then((stream) => {
        if (aborted) return;
        setVideoInput(stream);
      })
      .catch((err: unknown) => {
        console.error("[useVideoInput] getUserMedia rejected", err);
        setVideoInputError(true);
        dispatch({
          type: "ERROR",
          payload: {
            error: new Error("Selected camera is not available"),
          },
        });
      });

    return () => {
      aborted = true;
    };
  }, [videoInputId, dispatch]);

  const reset = useCallback(() => {
    if (videoInput && videoInput !== "no-device") {
      videoInput.getTracks().forEach((t) => t.stop());
    }
    setVideoInput(null);
  }, [videoInput]);

  return [videoInput, videoInputError, reset];
};
