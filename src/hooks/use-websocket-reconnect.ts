import { useEffect } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { CallState } from "../global-state/types";
import { useCallList } from "./use-call-list";

export const useWebsocketReconnect = ({
  calls,
  isMasterInputMuted,
  isWSReconnecting,
  isWSConnected,
  setIsWSReconnecting,
  wsConnect,
}: {
  calls: Record<string, CallState>;
  isMasterInputMuted: boolean;
  isWSReconnecting: boolean;
  isWSConnected: boolean;
  setIsWSReconnecting: (v: boolean) => void;
  wsConnect: (url: string) => void;
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
      setIsWSReconnecting(false);
    }
  }, [error, setIsWSReconnecting]);

  // Reset reconnecting state when connected
  useEffect(() => {
    if (isWSConnected && isWSReconnecting) {
      setIsWSReconnecting(false);
    }
  }, [isWSConnected, isWSReconnecting, setIsWSReconnecting]);

  // Handle reconnect loop
  useEffect(() => {
    let interval: number | null = null;
    let timeout: number | null = null;

    const shouldReconnect =
      websocket !== null &&
      websocket.readyState === WebSocket.CLOSED &&
      websocket.url &&
      !isWSConnected;

    if (shouldReconnect) {
      setIsWSReconnecting(true);

      // Try reconnecting every second
      interval = window.setInterval(() => {
        wsConnect(websocket.url);
      }, 1000);

      // Stop reconnect attempts after 5 seconds
      timeout = window.setTimeout(() => {
        if (interval) window.clearInterval(interval);
        setIsWSReconnecting(false);
      }, 5000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [websocket, wsConnect, isWSConnected, setIsWSReconnecting]);

  return { registerCallList, deregisterCall };
};
