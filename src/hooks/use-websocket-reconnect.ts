import { useEffect } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { CallState } from "../global-state/types";
import { useCallList } from "./use-call-list";

export const useWebsocketReconnect = ({
  calls,
  isMasterInputMuted,
  isWSReconnecting,
  isWSConnected,
  isConnectionConflict,
  setIsWSReconnecting,
  wsConnect,
}: {
  calls: Record<string, CallState>;
  isMasterInputMuted: boolean;
  isWSReconnecting: boolean;
  isWSConnected: boolean;
  isConnectionConflict: boolean;
  setIsWSReconnecting: (v: boolean) => void;
  wsConnect: (url: string) => void;
}) => {
  const [{ websocket, error }] = useGlobalState();

  const { deregisterCall, registerCallList } = useCallList({
    websocket,
    globalMute: isMasterInputMuted,
    numberOfCalls: Object.values(calls).length,
  });

  // Stop any spinner on error. Do NOT trigger reconnects on 409.
  useEffect(() => {
    if (error) {
      setIsWSReconnecting(false);
      const status = error?.statusCode || error?.error?.statusCode;
      if (status === 409) {
        // leave it stopped; local conflict flag controls future retries
        return;
      }
    }
  }, [error, setIsWSReconnecting]);

  // If we somehow became connected, clear reconnecting flag
  useEffect(() => {
    if (isWSConnected && isWSReconnecting) {
      setIsWSReconnecting(false);
    }
  }, [isWSConnected, isWSReconnecting, setIsWSReconnecting]);

  // Reconnect loop — only when NOT in conflict
  useEffect(() => {
    let interval: number | null = null;
    let timeout: number | null = null;

    const status = error.statusCode || error?.error?.statusCode;
    const isConflictFromError = status === 409;

    const shouldReconnect =
      !isConnectionConflict &&
      !isConflictFromError &&
      websocket !== null &&
      websocket.readyState === WebSocket.CLOSED &&
      websocket.url &&
      !isWSConnected;

    if (shouldReconnect) {
      setIsWSReconnecting(true);

      interval = window.setInterval(() => {
        wsConnect(websocket!.url);
      }, 1000);

      timeout = window.setTimeout(() => {
        if (interval) window.clearInterval(interval);
        setIsWSReconnecting(false);
      }, 5000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [
    websocket,
    wsConnect,
    isWSConnected,
    isWSReconnecting,
    setIsWSReconnecting,
    error,
    isConnectionConflict,
  ]);

  return { registerCallList, deregisterCall };
};
