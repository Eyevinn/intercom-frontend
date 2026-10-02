import { useEffect, useState } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { CallState } from "../global-state/types";
import { useCallList } from "./use-call-list";
import { authCircuitBreaker } from "../api/auth-circuit-breaker";

export const useWebsocketReconnect = ({
  calls,
  isMasterInputMuted,
  everConnected,
  isWSReconnecting,
  isWSConnected,
  isConnectionConflict,
  setIsWSReconnecting,
  wsConnect,
}: {
  calls: Record<string, CallState>;
  isMasterInputMuted: boolean;
  everConnected: boolean;
  isWSReconnecting: boolean;
  isWSConnected: boolean;
  isConnectionConflict: boolean;
  setIsWSReconnecting: (v: boolean) => void;
  wsConnect: (url: string) => void;
}) => {
  const [{ websocket, error }] = useGlobalState();
  // Bumped on every auth circuit breaker transition so the reconnect effect
  // below re-evaluates when a coordinated reauth pauses or resumes the app.
  const [breakerTick, setBreakerTick] = useState(0);

  const { deregisterCall, registerCallList } = useCallList({
    websocket,
    globalMute: isMasterInputMuted,
    numberOfCalls: Object.values(calls).length,
  });

  useEffect(
    () => authCircuitBreaker.subscribe(() => setBreakerTick((t) => t + 1)),
    []
  );

  // Reset reconnecting flag when connection succeeds
  useEffect(() => {
    if (isWSConnected && isWSReconnecting) {
      setIsWSReconnecting(false);
    }
  }, [isWSConnected, isWSReconnecting, setIsWSReconnecting]);

  // Handle reconnect attempts
  useEffect(() => {
    let interval: number | null = null;
    let timeout: number | null = null;

    // Always reset reconnecting flag on error
    if (error) {
      setIsWSReconnecting(false);
    }

    const shouldReconnect =
      everConnected &&
      websocket !== null &&
      websocket.readyState === WebSocket.CLOSED &&
      !!websocket.url &&
      !isWSConnected &&
      !isConnectionConflict &&
      // Hold off reconnecting while a global auth failure is being coordinated;
      // the breakerTick dependency re-runs this effect once reauth resolves.
      authCircuitBreaker.isActive();

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
  }, [
    everConnected,
    websocket,
    wsConnect,
    isWSConnected,
    isWSReconnecting,
    setIsWSReconnecting,
    error,
    isConnectionConflict,
    breakerTick,
  ]);

  return { registerCallList, deregisterCall };
};
