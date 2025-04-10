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
}

export function useWebSocket({ dispatch, onAction }: UseWebSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connect = useCallback(
    (url: string) => {
      dispatch({ type: "SET_WEBSOCKET", payload: null });

      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        dispatch({ type: "SET_WEBSOCKET", payload: ws });
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
        dispatch({
          type: "ERROR",
          payload: {
            error: new Error("Could not connect to the WebSocket server"),
          },
        });
        setIsConnected(false);
      };

      ws.onclose = () => {
        logger.yellow("WebSocket connection closed");
        setIsConnected(false);
      };

      socketRef.current = ws;
    },
    [onAction, dispatch]
  );

  const disconnect = () => {
    socketRef.current?.close();
    setIsConnected(false);
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
    disconnect,
    connect,
    isConnected,
  };
}
