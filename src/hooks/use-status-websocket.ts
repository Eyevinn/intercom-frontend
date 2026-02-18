import { useEffect, useRef, Dispatch } from "react";
import { getToken } from "../api/auth.ts";
import { TGlobalStateAction } from "../global-state/global-state-actions.ts";

// Backend sends `client` object on all event types
type StatusWebSocketMessage =
  | {
      type: "client_list";
      clients: Array<{
        clientId: string;
        name: string;
        role: string;
        location: string;
      }>;
    }
  | {
      type: "client_connected";
      client: {
        clientId: string;
        name: string;
        role: string;
        location: string;
      };
    }
  | {
      type: "client_disconnected";
      client: {
        clientId: string;
        name: string;
        role: string;
        location: string;
      };
    }
  // M2 call events
  | {
      type: "call_incoming";
      callId: string;
      callerId: string;
      callerName: string;
      callerRole: string;
      callerLocation: string;
      timestamp: string;
    }
  | {
      type: "call_started";
      callId: string;
      callerId: string;
      callerName: string;
      calleeId: string;
      calleeName: string;
      timestamp: string;
    }
  | {
      type: "call_ended";
      callId: string;
      callerId: string;
      callerName: string;
      calleeId: string;
      calleeName: string;
      endedBy: string;
      reason: string;
      timestamp: string;
    }
  // M3 talk events
  | {
      type: "talk_started";
      clientId: string;
      clientName: string;
      targets: Array<{ clientId: string; clientName: string; callId: string }>;
      timestamp: string;
    }
  | {
      type: "talk_stopped";
      clientId: string;
      clientName: string;
      timestamp: string;
    }
  | {
      type: "active_talks";
      talks: Array<{
        clientId: string;
        clientName: string;
        targets: Array<{
          clientId: string;
          clientName: string;
          callId: string;
        }>;
        startedAt: string;
      }>;
      timestamp: string;
    };

function getWebSocketUrl(): string {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string).replace(
    /\/+$/,
    ""
  );

  let wsBase: string;
  if (backendUrl.startsWith("https://")) {
    wsBase = backendUrl.replace("https://", "wss://");
  } else if (backendUrl.startsWith("http://")) {
    wsBase = backendUrl.replace("http://", "ws://");
  } else {
    // Relative URL or "/" — derive WebSocket URL from current page origin
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    wsBase = `${protocol}//${window.location.host}`;
  }

  const token = getToken();
  return `${wsBase}/api/v1/ws?token=${token}`;
}

export function useStatusWebSocket(dispatch: Dispatch<TGlobalStateAction>) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectDelayRef = useRef(1000);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;

      const token = getToken();
      if (!token) return;

      const url = getWebSocketUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Reset reconnect delay on successful connection
        reconnectDelayRef.current = 1000;
        // Store WebSocket in global state so other hooks (e.g. PTT talk events) can send messages
        dispatch({ type: "SET_WEBSOCKET", payload: ws });
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;

        try {
          const message = JSON.parse(
            event.data as string
          ) as StatusWebSocketMessage;

          switch (message.type) {
            case "client_list":
              dispatch({
                type: "SET_CLIENTS",
                payload: message.clients,
              });
              break;
            case "client_connected":
              dispatch({
                type: "CLIENT_CONNECTED",
                payload: message.client,
              });
              break;
            case "client_disconnected":
              dispatch({
                type: "CLIENT_DISCONNECTED",
                payload: { clientId: message.client.clientId },
              });
              break;
            case "call_incoming":
              dispatch({
                type: "CALL_INCOMING",
                payload: {
                  callId: message.callId,
                  callerId: message.callerId,
                  callerName: message.callerName,
                  callerRole: message.callerRole,
                  callerLocation: message.callerLocation,
                },
              });
              break;
            case "call_started":
              dispatch({
                type: "CALL_STARTED",
                payload: {
                  callId: message.callId,
                  callerId: message.callerId,
                  callerName: message.callerName,
                  calleeId: message.calleeId,
                  calleeName: message.calleeName,
                },
              });
              break;
            case "call_ended":
              dispatch({
                type: "CALL_ENDED",
                payload: {
                  callId: message.callId,
                  reason: message.reason,
                },
              });
              break;
            case "talk_started":
              dispatch({
                type: "TALK_STARTED",
                payload: {
                  clientId: message.clientId,
                  clientName: message.clientName,
                  targets: message.targets,
                  timestamp: message.timestamp,
                },
              });
              break;
            case "talk_stopped":
              dispatch({
                type: "TALK_STOPPED",
                payload: {
                  clientId: message.clientId,
                  clientName: message.clientName,
                  timestamp: message.timestamp,
                },
              });
              break;
            case "active_talks":
              dispatch({
                type: "SET_ACTIVE_TALKS",
                payload: message.talks,
              });
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Clear WebSocket from global state
        dispatch({ type: "SET_WEBSOCKET", payload: null });
        if (!mountedRef.current) return;

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s max
        const delay = reconnectDelayRef.current;
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(delay * 2, 30000);
          connect();
        }, delay);
      };

      ws.onerror = () => {
        // onclose will fire after onerror, triggering reconnect
      };
    }

    connect();

    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [dispatch]);
}
