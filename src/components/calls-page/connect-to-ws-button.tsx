import styled from "@emotion/styled";
import { useState } from "react";
import { CheckIcon } from "../../assets/icons/icon";
import { useGlobalState } from "../../global-state/context-provider";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { ConnectToWsModal } from "./connect-to-ws-modal";

const ConnectWebSocketWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const ConnectButton = styled(PrimaryButton)<{
  isConnected: boolean;
}>`
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
  isReconnecting: boolean;
  connect: (url: string) => void;
}

export const ConnectToWSButton = ({
  isConnected,
  isReconnecting,
  connect,
}: ConnectToWSButtonProps) => {
  const [{ websocket }, dispatch] = useGlobalState();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
    <ConnectWebSocketWrapper>
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
    </ConnectWebSocketWrapper>
  );
};
