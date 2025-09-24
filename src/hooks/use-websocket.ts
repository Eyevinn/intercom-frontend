import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions";
import logger from "../utils/logger";

type WebSocketAction =
  | "toggle_input_mute"
  | "toggle_output_mute"
  | "toggle_global_mute"
  | "increase_volume"
  | "decrease_volume"
  | "push_to_talk_start"
  | "push_to_talk_stop";

interface UseWebSocketProps {
  dispatch: Dispatch<TGlobalStateAction>;
  onAction: (action: WebSocketAction, index?: number) => void;
  onConnected?: () => void;
  resetLastSentCallsState?: () => void;

  /** NEW: called when server rejects with 409 */
  onConflict?: (message?: string) => void;
}

export function useWebSocket({
  dispatch,
  onAction,
  onConnected,
  resetLastSentCallsState,
  onConflict,
}: UseWebSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isWSConnected, setIsWSConnected] = useState<boolean>(false);

  const wsConnect = useCallback(
    (url: string) => {
      dispatch({ type: "SET_WEBSOCKET", payload: null });

      const ws = new WebSocket(url);
      socketRef.current = ws;

      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          dispatch({
            type: "ERROR",
            payload: {
              error: new Error("Could not connect to the WebSocket server"),
            },
          });
          ws.close();
        }
      }, 3000);

      ws.onopen = () => {
        clearTimeout(timeout);
        // Mark connected; if server immediately sends 409 we’ll flip back to false
        setIsWSConnected(true);
        dispatch({ type: "SET_WEBSOCKET", payload: ws });
        if (onConnected) onConnected();
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          // Handle connection conflict
          if (data?.type === "error" && data?.statusCode === 409) {
            // Local UI path
            if (onConflict) onConflict(data?.message);
            // Create a real Error so name/message render correctly
            const err = new Error(data?.message || "Connection conflict");
            err.statusCode = 409;

            dispatch({
              type: "ERROR",
              payload: { error: err },
            });
            setIsWSConnected(false);
            ws.close();
            return;
          }

          if (data?.action) {
            onAction(data.action, data.index);
          }
        } catch (e) {
          logger.red(`Error parsing WebSocket message: ${e}`);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        dispatch({
          type: "ERROR",
          payload: {
            error: new Error("Could not connect to the WebSocket server"),
          },
        });
        setIsWSConnected(false);
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        logger.yellow("WebSocket connection closed");
        setIsWSConnected(false);
      };

      socketRef.current = ws;
    },
    [onAction, dispatch, onConnected, onConflict]
  );

  const wsDisconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;

    if (resetLastSentCallsState) resetLastSentCallsState();

    setIsWSConnected(false);
    dispatch({ type: "SET_WEBSOCKET", payload: null });
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  return { wsDisconnect, wsConnect, isWSConnected };
}
