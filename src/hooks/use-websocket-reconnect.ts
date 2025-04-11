import { useEffect } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { CallState } from "../global-state/types";
import { useCallList } from "./use-call-list";

export const useWebsocketReconnect = ({
  calls,
  isMasterInputMuted,
  isReconnecting,
  isConnected,
  setIsReconnecting,
  connect,
}: {
  calls: Record<string, CallState>;
  isMasterInputMuted: boolean;
  isReconnecting: boolean;
  isConnected: boolean;
  setIsReconnecting: (v: boolean) => void;
  connect: (url: string) => void;
}) => {
  const [{ websocket, error }] = useGlobalState();

  const { deregisterCall, registerCallList } = useCallList({
    websocket,
    globalMute: isMasterInputMuted,
    numberOfCalls: Object.values(calls).length,
  });

  // Handle WebSocket errors
  useEffect(() => {
    if (error) {
      setIsReconnecting(false);
    }
  }, [error, setIsReconnecting]);

  // Reset reconnecting state when connected
  useEffect(() => {
    if (isConnected && isReconnecting) {
      setIsReconnecting(false);
    }
  }, [isConnected, isReconnecting, setIsReconnecting]);

  // Handle reconnect loop
  useEffect(() => {
    let interval: number | null = null;
    let timeout: number | null = null;

    const shouldReconnect =
      websocket !== null &&
      websocket.readyState === WebSocket.CLOSED &&
      websocket.url &&
      !isConnected;

    if (shouldReconnect) {
      setIsReconnecting(true);

      // Try reconnecting every second
      interval = window.setInterval(() => {
        connect(websocket.url);
      }, 1000);

      // Stop reconnect attempts after 5 seconds
      timeout = window.setTimeout(() => {
        if (interval) window.clearInterval(interval);
        setIsReconnecting(false);
      }, 5000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [websocket, connect, isConnected, setIsReconnecting]);

  return { registerCallList, deregisterCall };
};
