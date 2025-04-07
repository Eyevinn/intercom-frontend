import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { CheckIcon } from "../../assets/icons/icon";
import { useGlobalState } from "../../global-state/context-provider";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { ConnectToWsModal } from "./connect-to-ws-modal";

const ConnectButton = styled(PrimaryButton)<{ isConnected: boolean }>`
  background: ${({ isConnected }) => (isConnected ? "#73d16d" : "")};
  text-align: center;
  padding: 1rem;
  align-items: center;
  display: flex;

  svg {
    fill: #482307;
  }
`;

interface ConnectToWSButtonProps {
  isConnected: boolean;
  connect: (url: string) => void;
}

export const ConnectToWSButton = ({
  isConnected,
  connect,
}: ConnectToWSButtonProps) => {
  const [{ websocket }, dispatch] = useGlobalState();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  const handleConnect = (url: string) => {
    connect(url);
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.close();
    }

    dispatch({
      type: "SET_WEBSOCKET",
      payload: null,
    });
  };

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.CLOSED) {
      setIsReconnecting(true);
    } else {
      setIsReconnecting(false);
    }
  }, [websocket]);

  const renderButtonContent = () => {
    if (isConnected) {
      return "Companion";
    }
    if (isReconnecting) {
      return "Reconnecting...";
    }
    return "Connect to Companion";
  };

  return (
    <>
      <ConnectButton
        isConnected={isConnected}
        onClick={isConnected ? handleDisconnect : () => setIsOpen(true)}
      >
        {renderButtonContent()}
        {isConnected && <CheckIcon />}
        {isReconnecting && <Spinner className="companion-loader" />}
      </ConnectButton>
      <ConnectToWsModal
        isOpen={isOpen}
        handleConnect={handleConnect}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
