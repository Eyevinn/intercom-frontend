import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";

const Device = styled.div`
  padding: 0.5rem;
`;

export const DeviceSelector: FC = () => {
  const [deviceList, setDeviceList] = useState<null | MediaDeviceInfo[]>(null);

  useEffect(() => {
    let aborted = false;

    navigator.mediaDevices
      .enumerateDevices()
      .then((result) => {
        if (aborted) return;

        setDeviceList(result);
      })
      .catch(console.error);

    return () => {
      aborted = true;
    };
  }, []);

  return (
    <>
      <p>Device List</p>
      <br />
      {deviceList &&
        deviceList.map((device) => (
          <Device key={device.deviceId}>
            {device.deviceId} {device.groupId} {device.kind} {device.label}{" "}
          </Device>
        ))}
    </>
  );
};
