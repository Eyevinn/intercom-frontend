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

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: center;

  &:hover span,
  &:focus-within span {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%, 0.4rem);
  }
`;

const TooltipText = styled.span`
  position: absolute;
  top: 115%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 1.4rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.18s ease;
  pointer-events: none;
  z-index: 20;
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
  const [isConnectionConflict, setConnectionConflict] = useState(false);
  const [{ calls }, dispatch] = useGlobalState();

  // map call ids to indices for actions
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
      setConnectionConflict(false);
      sendCallsStateUpdate();
    },
    resetLastSentCallsState: () => {
      resetLastSentCallsState();
    },
    onConflict: () => {
      setConnectionConflict(true);
      setIsWSReconnecting(false);
    },
  });

  useWebsocketReconnect({
    calls,
    isMasterInputMuted,
    isWSReconnecting,
    isWSConnected,
    isConnectionConflict, // block retries when true
    setIsWSReconnecting,
    wsConnect,
  });

  const handleConnect = (url: string) => {
    setConnectionConflict(false);
    wsConnect(url);
    setIsOpen(false);
  };

  const handlePrimaryClick = () => {
    if (isConnectionConflict) {
      setConnectionConflict(false);
      setIsWSReconnecting(false);
      wsDisconnect();
      setIsOpen(true);
      return;
    }
    if (isWSConnected) {
      wsDisconnect();
      return;
    }
    setIsOpen(true);
  };

  const renderButtonContent = () => {
    if (isWSConnected) return "Companion";
    if (isWSReconnecting) return "Reconnecting...";
    return "Connect to Companion";
  };

  return (
    <ConnectWebSocketWrapper>
      <TooltipWrapper>
        <ConnectButton isConnected={isWSConnected} onClick={handlePrimaryClick}>
          {renderButtonContent()}
          {isWSConnected && <CheckIcon />}
          {!isConnectionConflict && isWSReconnecting && (
            <Spinner className="companion-loader" />
          )}
        </ConnectButton>

        {isWSConnected && <TooltipText id="disconnect">Disconnect</TooltipText>}
      </TooltipWrapper>

      <ConnectToWsModal
        isOpen={isOpen}
        handleConnect={handleConnect}
        onClose={() => setIsOpen(false)}
      />
    </ConnectWebSocketWrapper>
  );
};
