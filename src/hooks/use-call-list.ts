import { useCallback, useEffect, useRef } from "react";

type CallData = {
  isInputMuted: boolean;
  isOutputMuted: boolean;
  volume: number;
};

type UseCallListProps = {
  websocket: WebSocket | null;
  globalMute: boolean;
  numberOfCalls: number;
};
export function useCallList({
  websocket,
  globalMute,
  numberOfCalls,
}: UseCallListProps) {
  const callLineStates = useRef<Record<string, CallData>>({});
  const lastSentCallsState = useRef<string>("");

  const globalMuteRef = useRef(globalMute);
  const numberOfCallsRef = useRef(numberOfCalls);

  const sendCallsStateUpdate = useCallback(() => {
    const payload = {
      type: "CALLS_STATE_UPDATE",
      globalMute: globalMuteRef.current,
      numberOfCalls: numberOfCallsRef.current,
      calls: Object.entries(callLineStates.current).map(([callId, state]) => ({
        callId,
        ...state,
      })),
    };

    const serialized = JSON.stringify(payload);

    if (
      websocket &&
      websocket.readyState === WebSocket.OPEN &&
      serialized !== lastSentCallsState.current
    ) {
      websocket.send(serialized);
      lastSentCallsState.current = serialized;
      console.log("Sent CALLS_STATE_UPDATE:", payload);
    }
  }, [websocket]);

  useEffect(() => {
    globalMuteRef.current = globalMute;
    numberOfCallsRef.current = numberOfCalls;
    sendCallsStateUpdate();
  }, [globalMute, numberOfCalls, sendCallsStateUpdate]);

  const registerCallList = useCallback(
    (callId: string, data: CallData) => {
      const prev = callLineStates.current[callId];
      const hasChanged =
        !prev ||
        prev.isInputMuted !== data.isInputMuted ||
        prev.isOutputMuted !== data.isOutputMuted ||
        prev.volume !== data.volume;

      if (!hasChanged) return;

      callLineStates.current[callId] = data;

      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            type: "CALL_STATE_UPDATE",
            callId,
            ...data,
          })
        );
        console.log("Sent CALL_STATE_UPDATE:", { callId, ...data });
      }
    },
    [websocket]
  );

  const deregisterCall = useCallback(
    (callId: string) => {
      delete callLineStates.current[callId];

      sendCallsStateUpdate();
    },
    [sendCallsStateUpdate]
  );

  return { registerCallList, deregisterCall };
}
