import { useEffect, useState } from "react";
import { TJoinProductionOptions } from "./types.ts";

type TProps = {
  joinProductionOptions: TJoinProductionOptions | null;
};
export const useDeviceLabels = ({ joinProductionOptions }: TProps) => {
  const [deviceLabels, setDeviceLabels] = useState<
    [string | undefined, string | undefined] | null
  >(null);

  useEffect(() => {
    if (!joinProductionOptions) return;

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setDeviceLabels([
        devices.find((d) => d.deviceId === joinProductionOptions.audioinput)
          ?.label,
        devices.find((d) => d.deviceId === joinProductionOptions.audiooutput)
          ?.label,
      ]);
    });
  }, [joinProductionOptions]);

  return deviceLabels
    ? {
        inputLabel: deviceLabels[0],
        outputLabel: deviceLabels[1],
      }
    : null;
};
