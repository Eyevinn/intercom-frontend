import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { RefreshIcon } from "../../assets/icons/icon";
import { isBrowserFirefox, isMobile } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useDevicePermissions } from "../../hooks/use-device-permission";
import { useFetchDevices } from "../../hooks/use-fetch-devices";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { Modal } from "../modal/modal";

export const StyledRefreshBtn = styled(PrimaryButton)`
  margin-right: 1.5rem;
  display: flex;
  align-items: center;

  svg,
  .refresh-devices {
    width: 2rem;
    height: 2rem;
    fill: #242424;
  }
`;

export const ReloadDevicesButton = () => {
  const [{ devices }, dispatch] = useGlobalState();
  const [deviceRefresh, setDeviceRefresh] = useState(false);
  const [firefoxWarningModalOpen, setFirefoxWarningModalOpen] = useState(false);

  const { permission } = useDevicePermissions({
    continueToApp: true,
  });

  const [getUpdatedDevices] = useFetchDevices({
    dispatch,
    permission,
  });

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
    if (isBrowserFirefox && !isMobile) {
      setFirefoxWarningModalOpen(true);
    } else {
      setDeviceRefresh(true);
      getUpdatedDevices();
    }
  };

  return (
    <>
      <StyledRefreshBtn
        type="button"
        title="Refresh devices"
        onClick={() => reloadDevices()}
      >
        <div>Refresh Devices</div>
        {!deviceRefresh && <RefreshIcon />}
        {deviceRefresh && <Spinner className="refresh-devices" />}
      </StyledRefreshBtn>
      {firefoxWarningModalOpen && (
        <Modal onClose={() => setFirefoxWarningModalOpen(false)}>
          <DisplayContainerHeader>Reset permissions</DisplayContainerHeader>
          <p>
            To reload devices Firefox needs the permission to be manually reset,
            please remove permission and reload page instead.
          </p>
        </Modal>
      )}
    </>
  );
};
