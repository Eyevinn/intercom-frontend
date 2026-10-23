import { Dispatch, useEffect } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions";
import { noop, uniqBy } from "../helpers";
import logger from "../utils/logger";

type TUseVideoDeviceLabels = {
  enabled: boolean;
  dispatch: Dispatch<TGlobalStateAction>;
};

const byKind = (devices: MediaDeviceInfo[], kind: MediaDeviceKind) =>
  uniqBy(
    devices.filter((d) => d.kind === kind),
    (d) => d.deviceId
  );

const needsCameraWarmUp = (devices: MediaDeviceInfo[]) => {
  const cameras = devices.filter((d) => d.kind === "videoinput");
  return cameras.length === 0 || cameras.some((d) => !d.label);
};

export const useVideoDeviceLabels = ({
  enabled,
  dispatch,
}: TUseVideoDeviceLabels) => {
  useEffect(() => {
    if (!enabled) return noop;

    let cancelled = false;
    const { mediaDevices } = navigator;

    const refresh = async () => {
      let devices = await mediaDevices.enumerateDevices();

      if (needsCameraWarmUp(devices)) {
        const stream = await mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        stream.getTracks().forEach((t) => t.stop());
        devices = await mediaDevices.enumerateDevices();
      }

      if (cancelled) return;

      dispatch({
        type: "DEVICES_UPDATED",
        payload: {
          input: byKind(devices, "audioinput"),
          output: byKind(devices, "audiooutput"),
          videoInput: byKind(devices, "videoinput"),
        },
      });
    };

    const onDeviceChange = () => {
      refresh().catch((err) => {
        logger.yellow(`[useVideoDeviceLabels] refresh failed: ${err}`);
      });
    };

    onDeviceChange();
    mediaDevices.addEventListener("devicechange", onDeviceChange);

    return () => {
      cancelled = true;
      mediaDevices.removeEventListener("devicechange", onDeviceChange);
    };
  }, [enabled, dispatch]);
};
