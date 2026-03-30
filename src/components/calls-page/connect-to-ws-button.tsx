import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
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
  svg {
    fill: #1a1a1a;
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
  autoCompanionUrl?: string;
  onCompanionUrlChange?: (url: string | undefined) => void;
}

export const ConnectToWSButton = ({
  callIndexMap,
  callActionHandlers,
  isMasterInputMuted,
  handleToggleGlobalMute,
  sendCallsStateUpdate,
  resetLastSentCallsState,
  autoCompanionUrl,
  onCompanionUrlChange,
}: ConnectToWSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWSReconnecting, setIsWSReconnecting] = useState(false);
  const [isConnectionConflict, setConnectionConflict] = useState(false);
  const autoConnectedRef = useRef(false);
  const everConnectedRef = useRef(false);
  const isManualConnectRef = useRef(false);
  const connectingUrlRef = useRef<string | undefined>(undefined);
  const [{ calls }, dispatch] = useGlobalState();

  const handleAction = useWebsocketActions({
    callIndexMap,
    callActionHandlers,
    handleToggleGlobalMute,
  });

  const handleWsError = useCallback(
    (message: string) => {
      setIsConnecting(false);
      const errorMessage = `Could not connect to Companion: ${message}`;
      if (isManualConnectRef.current) {
        dispatch({
          type: "ERROR",
          payload: { error: new Error(errorMessage) },
        });
      } else {
        dispatch({ type: "WARNING", payload: { message: errorMessage } });
      }
    },
    [dispatch]
  );

  const { wsConnect, wsDisconnect, isWSConnected } = useWebSocket({
    onAction: handleAction,
    dispatch,
    onConnected: () => {
      everConnectedRef.current = true;
      isManualConnectRef.current = false;
      setIsConnecting(false);
      setConnectionConflict(false);
      sendCallsStateUpdate();
      onCompanionUrlChange?.(connectingUrlRef.current);
    },
    resetLastSentCallsState: () => {
      resetLastSentCallsState();
    },
    onConflict: () => {
      setIsConnecting(false);
      setConnectionConflict(true);
      setIsWSReconnecting(false);
    },
    onError: handleWsError,
  });

  useWebsocketReconnect({
    calls,
    isMasterInputMuted,
    everConnected: everConnectedRef.current,
    isWSReconnecting,
    isWSConnected,
    isConnectionConflict, // block retries when true
    setIsWSReconnecting,
    wsConnect,
  });

  const wsConnectRef = useRef(wsConnect);
  wsConnectRef.current = wsConnect;

  useEffect(() => {
    if (isWSReconnecting || isWSConnected) setIsConnecting(false);
  }, [isWSReconnecting, isWSConnected]);

  const autoConnectTimerFiredRef = useRef(false);

  useEffect(() => {
    if (!autoCompanionUrl || autoConnectedRef.current || isWSConnected)
      return undefined;
    autoConnectedRef.current = true;
    autoConnectTimerFiredRef.current = false;
    isManualConnectRef.current = false;
    setIsConnecting(true);
    const url = autoCompanionUrl;
    connectingUrlRef.current = url;
    const id = window.setTimeout(() => {
      autoConnectTimerFiredRef.current = true;
      wsConnectRef.current(url);
    }, 1500);
    return () => {
      window.clearTimeout(id);
      if (!autoConnectTimerFiredRef.current) {
        // Timer was cancelled before firing (e.g. React Strict Mode remount)
        // — allow retry on the next run
        autoConnectedRef.current = false;
        setIsConnecting(false);
      }
    };
  }, [autoCompanionUrl, isWSConnected]);

  const handleConnect = (url: string) => {
    setConnectionConflict(false);
    isManualConnectRef.current = true;
    connectingUrlRef.current = url;
    setIsConnecting(true);
    wsConnect(url);
    setIsOpen(false);
  };

  const handlePrimaryClick = () => {
    if (isConnectionConflict) {
      setConnectionConflict(false);
      setIsWSReconnecting(false);
      everConnectedRef.current = false;
      wsDisconnect();
      onCompanionUrlChange?.(undefined);
      setIsOpen(true);
      return;
    }
    if (isWSConnected) {
      everConnectedRef.current = false;
      setIsConnecting(false);
      wsDisconnect();
      onCompanionUrlChange?.(undefined);
      return;
    }
    setIsOpen(true);
  };

  const renderButtonContent = () => {
    if (isWSConnected) return "Companion";
    if (isConnecting || isWSReconnecting)
      return everConnectedRef.current ? "Reconnecting..." : "Connecting...";
    return "Connect to Companion";
  };

  return (
    <ConnectWebSocketWrapper>
      <TooltipWrapper>
        <ConnectButton isConnected={isWSConnected} onClick={handlePrimaryClick}>
          {renderButtonContent()}
          {isWSConnected && <CheckIcon />}
          {!isConnectionConflict && (isConnecting || isWSReconnecting) && (
            <Spinner className="companion-loader" />
          )}
        </ConnectButton>

        {isWSConnected && <TooltipText id="disconnect">Disconnect</TooltipText>}
      </TooltipWrapper>

      <ConnectToWsModal
        isOpen={isOpen}
        handleConnect={handleConnect}
        onClose={() => setIsOpen(false)}
        initialUrl={autoCompanionUrl}
      />
    </ConnectWebSocketWrapper>
  );
};
