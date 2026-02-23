import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import { RefreshIcon } from "../../assets/icons/icon";
import { isBrowserFirefox, isMobile } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useDevicePermissions } from "../../hooks/use-device-permission";
import { useFetchDevices } from "../../hooks/use-fetch-devices";
import { Spinner } from "../loader/loader";
import { Modal } from "../modal/modal";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const RefreshIconButton = styled.button<{ isRefreshing: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  transform: translateY(1px);
  transition: all 0.15s ease;
  flex-shrink: 0;

  svg,
  .refresh-devices {
    width: 2rem;
    height: 2rem;
    fill: #59cbe8;
    animation: ${spin} 0.8s linear infinite;
    animation-play-state: ${({ isRefreshing }) =>
      isRefreshing ? "running" : "paused"};
  }

  &:hover {
    background: rgba(89, 203, 232, 0.1);
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
      <RefreshIconButton
        type="button"
        title="Refresh devices"
        onClick={() => reloadDevices()}
        isRefreshing={deviceRefresh}
      >
        {!deviceRefresh && <RefreshIcon />}
        {deviceRefresh && <Spinner className="refresh-devices" />}
      </RefreshIconButton>
      {firefoxWarningModalOpen && (
        <Modal
          onClose={() => setFirefoxWarningModalOpen(false)}
          title="Reset permissions"
        >
          <p>
            To reload devices Firefox needs the permission to be manually reset,
            please remove permission and reload page instead.
          </p>
        </Modal>
      )}
    </>
  );
};
