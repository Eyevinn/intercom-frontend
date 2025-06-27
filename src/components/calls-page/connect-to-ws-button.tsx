import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { CheckIcon } from "../../assets/icons/icon";
import { useGlobalState } from "../../global-state/context-provider";
import { useWebSocket } from "../../hooks/use-websocket";
import { useWebsocketActions } from "../../hooks/use-websocket-actions";
import { useWebsocketReconnect } from "../../hooks/use-websocket-reconnect";
import { PrimaryButton } from "../form-elements/form-elements";
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
  border: 0.2rem solid
    ${({ isConnected }) => (isConnected ? "#73d16d" : "rgba(89, 203, 232, 1)")};
  text-align: center;
  padding: 1rem;
  align-items: center;
  display: flex;
  margin-right: 1rem;

  svg {
    fill: #482307;
  }
`;

interface ConnectToWSButtonProps {
  callIndexMap: React.MutableRefObject<Record<number, string>>;
  callActionHandlers: React.MutableRefObject<
    Record<string, Record<string, () => void>>
  >;
  isMasterInputMuted: boolean;
  handleToggleGlobalMute: () => void;
  sendCallsStateUpdate: () => void;
  resetLastSentCallsState: () => void;
}

export const ConnectToWSButton = ({
  callIndexMap,
  callActionHandlers,
  isMasterInputMuted,
  handleToggleGlobalMute,
  sendCallsStateUpdate,
  resetLastSentCallsState,
}: ConnectToWSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWSReconnecting, setIsWSReconnecting] = useState(false);
  const [{ error, calls }, dispatch] = useGlobalState();

  useEffect(() => {
    if (error) {
      setIsWSReconnecting(false);
    }
  }, [error, setIsWSReconnecting]);

  useEffect(() => {
    const indexMap = callIndexMap.current;
    Object.keys(calls).forEach((callId, i) => {
      indexMap[i + 1] = callId;
    });
  }, [calls, callIndexMap]);

  const handleAction = useWebsocketActions({
    callIndexMap,
    callActionHandlers,
    handleToggleGlobalMute,
  });

  const { wsConnect, wsDisconnect, isWSConnected } = useWebSocket({
    onAction: handleAction,
    dispatch,
    onConnected: () => {
      sendCallsStateUpdate();
    },
    resetLastSentCallsState: () => {
      resetLastSentCallsState();
    },
  });

  useWebsocketReconnect({
    calls,
    isMasterInputMuted,
    isWSReconnecting,
    isWSConnected,
    setIsWSReconnecting,
    wsConnect,
  });

  const handleConnect = (url: string) => {
    wsConnect(url);
    setIsOpen(false);
  };

  const renderButtonContent = () => {
    if (isWSConnected) return "Companion";
    if (isWSReconnecting) return "Reconnecting...";
    return "Connect to Companion";
  };

  return (
    <ConnectWebSocketWrapper>
      <ConnectButton
        isConnected={isWSConnected}
        onClick={isWSConnected ? wsDisconnect : () => setIsOpen(true)}
      >
        {renderButtonContent()}
        {isWSConnected && <CheckIcon />}
        {isWSReconnecting && <Spinner className="companion-loader" />}
      </ConnectButton>

      <ConnectToWsModal
        isOpen={isOpen}
        handleConnect={handleConnect}
        onClose={() => setIsOpen(false)}
      />
    </ConnectWebSocketWrapper>
  );
};
