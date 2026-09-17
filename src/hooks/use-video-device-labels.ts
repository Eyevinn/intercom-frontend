import { Dispatch, useEffect } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions";
import { noop, uniqBy } from "../helpers";

let warmedUpInSession = false;

type TUseVideoDeviceLabels = {
  enabled: boolean;
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useVideoDeviceLabels = ({
  enabled,
  dispatch,
}: TUseVideoDeviceLabels) => {
  useEffect(() => {
    if (!enabled || warmedUpInSession) return noop;

    let cancelled = false;
    warmedUpInSession = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(async (stream) => {
        stream.getTracks().forEach((t) => t.stop());
        if (cancelled) return;

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;

        dispatch({
          type: "DEVICES_UPDATED",
          payload: {
            input: uniqBy(
              devices.filter((d) => d.kind === "audioinput"),
              (d) => d.deviceId
            ),
            output: uniqBy(
              devices.filter((d) => d.kind === "audiooutput"),
              (d) => d.deviceId
            ),
            videoInput: uniqBy(
              devices.filter((d) => d.kind === "videoinput"),
              (d) => d.deviceId
            ),
          },
        });
      })
      .catch(() => {
        warmedUpInSession = false;
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, dispatch]);
};
