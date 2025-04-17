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
}

export function useWebSocket({
  dispatch,
  onAction,
  onConnected,
  resetLastSentCallsState,
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

        setIsWSConnected(true);
        dispatch({ type: "SET_WEBSOCKET", payload: ws });

        if (onConnected) {
          onConnected();
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action) {
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
    [onAction, dispatch, onConnected]
  );

  const wsDisconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;

    if (resetLastSentCallsState) {
      resetLastSentCallsState();
    }

    setIsWSConnected(false);
    dispatch({ type: "SET_WEBSOCKET", payload: null });
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current?.close();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    wsDisconnect,
    wsConnect,
    isWSConnected,
  };
}
