import { Dispatch, useEffect } from "react";
import { DevicesState } from "../global-state/types";
import { TGlobalStateAction } from "../global-state/global-state-actions";
import { useStorage } from "../components/accessing-local-storage/access-local-storage";

type TUseLocalUserSettings = {
  devices: DevicesState;
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useLocalUserSettings = ({
  devices,
  dispatch,
}: TUseLocalUserSettings) => {
  const { readFromStorage, clearStorage } = useStorage();
  useEffect(() => {
    if (devices.input || devices.output) {
      const storedAudioInput = readFromStorage("audioinput");
      const storedAudioOutput = readFromStorage("audiooutput");

      const foundInputDevice =
        devices.input?.find((device) => device.deviceId === storedAudioInput)
          ?.deviceId ??
        (storedAudioInput === "no-device" ? "no-device" : undefined);

      const foundOutputDevice = devices.output?.find(
        (device) => device.deviceId === storedAudioOutput
      )?.deviceId;

      if (!foundInputDevice) clearStorage("audioinput");

      if (!foundOutputDevice) clearStorage("audiooutput");

      const payload = {
        username: readFromStorage("username") || "",
        audioinput: foundInputDevice,
        audiooutput: foundOutputDevice,
      };

      dispatch({
        type: "UPDATE_USER_SETTINGS",
        payload,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, dispatch]);
};
