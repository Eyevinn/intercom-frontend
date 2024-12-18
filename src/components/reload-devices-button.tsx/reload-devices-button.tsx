import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { RefreshIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { isBrowserFirefox, isMobile } from "../../bowser";
import { DevicesState } from "../../global-state/types";

const StyledRefreshBtn = styled(PrimaryButton)`
  margin-right: 1.5rem;
  display: flex;
  align-items: center;

  svg,
  .refresh-devices {
    width: 2rem;
    height: 2rem;
  }

  &.dummy {
    background-color: #242424;
    pointer-events: none;
  }
`;

export const ReloadDevicesButton = ({
  handleReloadDevices,
  setFirefoxWarningModalOpen,
  devices,
  isDummy,
}: {
  handleReloadDevices: () => void;
  setFirefoxWarningModalOpen?: () => void;
  devices: DevicesState;
  isDummy?: boolean;
}) => {
  const [deviceRefresh, setDeviceRefresh] = useState(false);

  useEffect(() => {
    let timeout: number | null = null;

    timeout = window.setTimeout(() => {
      setDeviceRefresh(false);
    }, 800);

    return () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [devices]);

  const reloadDevices = () => {
    if (isBrowserFirefox && !isMobile && setFirefoxWarningModalOpen) {
      setFirefoxWarningModalOpen();
    } else {
      setDeviceRefresh(true);
      handleReloadDevices();
    }
  };

  return (
    <StyledRefreshBtn
      type="button"
      title={isDummy ? "" : "Refresh devices"}
      className={isDummy ? "dummy" : ""}
      disabled={isDummy}
      onClick={() => reloadDevices()}
    >
      <div>Refresh Devices</div>
      {!deviceRefresh && <RefreshIcon />}
      {deviceRefresh && <Spinner className="refresh-devices" />}
    </StyledRefreshBtn>
  );
};
