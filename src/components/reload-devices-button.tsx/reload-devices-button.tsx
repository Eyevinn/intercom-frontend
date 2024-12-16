import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { RefreshIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { isBrowserFirefox, isMobile } from "../../bowser";

const StyledRefreshBtn = styled(PrimaryButton)`
  padding: 0;
  margin: 0;
  width: 3.5rem;
  height: 3.5rem;
  margin-left: 1.5rem;
  flex-shrink: 0; /* Prevent shrinking */
  flex-basis: auto; /* Prevent shrinking */

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
  devices: MediaDeviceInfo[];
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
      {!deviceRefresh && <RefreshIcon />}
      {deviceRefresh && <Spinner className="refresh-devices" />}
    </StyledRefreshBtn>
  );
};
