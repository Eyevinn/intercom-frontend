import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { RefreshIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { isBrowserFirefox, isMobile } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchDevices } from "../../hooks/use-fetch-devices";
import { useDevicePermissions } from "../../hooks/use-device-permission";
import { Modal } from "../modal/modal";
import { DisplayContainerHeader } from "../landing-page/display-container-header";

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

export const ReloadDevicesButton = () => {
  const [{ devices }, dispatch] = useGlobalState();
  const [deviceRefresh, setDeviceRefresh] = useState(false);
  const [firefoxWarningModalOpen, setFirefoxWarningModalOpen] = useState(false);

  const { permission } = useDevicePermissions({
    continueToApp: true,
  });

  const [refresh] = useFetchDevices({
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
      refresh();
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
