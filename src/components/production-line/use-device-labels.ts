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

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          setDeviceLabels([
            devices
              .filter((d) => d.kind === "audioinput")
              .find((d) => d.deviceId === joinProductionOptions.audioinput)
              ?.label,
            devices
              .filter((d) => d.kind === "audiooutput")
              .find((d) => d.deviceId === joinProductionOptions.audiooutput)
              ?.label,
          ]);
        });
      });
  }, [joinProductionOptions]);

  return deviceLabels
    ? {
        inputLabel: deviceLabels[0],
        outputLabel: deviceLabels[1],
      }
    : null;
};
