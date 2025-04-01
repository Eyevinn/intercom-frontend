import { useCallback, useEffect, useRef, useState } from "react";

type WebSocketAction =
  | "toggle_input_mute"
  | "toggle_output_mute"
  | "toggle_global_mute"
  | "increase_volume"
  | "decrease_volume"
  | "push_to_talk";

interface UseWebSocketProps {
  onAction: (action: WebSocketAction) => void;
}

export function useWebSocket({ onAction }: UseWebSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connect = useCallback(
    (url: string) => {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected YAY");
        setIsConnected(true);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action) {
            onAction(data.action);
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };

      socketRef.current = ws;
    },
    [onAction]
  );

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    connect,
    isConnected,
  };
}
