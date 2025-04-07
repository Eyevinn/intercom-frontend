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
    const entries = Object.entries(callLineStates.current);

    const payload = {
      type: "CALLS_STATE_UPDATE",
      globalMute: globalMuteRef.current,
      numberOfCalls: numberOfCallsRef.current,
      calls: entries.map(([callId, state], index) => ({
        callId,
        index: index + 1,
        ...state,
      })),
    };

    const serialized = JSON.stringify(payload);

    if (
      websocket &&
      websocket.readyState === WebSocket.OPEN &&
      serialized !== lastSentCallsState.current
    ) {
      console.log("Sending CALLS_STATE_UPDATE");
      websocket.send(serialized);
      lastSentCallsState.current = serialized;
    }
  }, [websocket]);

  useEffect(() => {
    globalMuteRef.current = globalMute;
    numberOfCallsRef.current = numberOfCalls;
    sendCallsStateUpdate();
  }, [globalMute, numberOfCalls, sendCallsStateUpdate]);

  const registerCallList = useCallback(
    (callId: string, data: CallData, isGlobalMute = false) => {
      const prev = callLineStates.current[callId];
      const isNewCall = prev === undefined;

      callLineStates.current[callId] = data;

      if (isGlobalMute) {
        console.log("isGlobalMute", isGlobalMute);
      }

      if (isNewCall) {
        return;
      }

      const hasChanged =
        prev.isInputMuted !== data.isInputMuted ||
        prev.isOutputMuted !== data.isOutputMuted ||
        prev.volume !== data.volume;

      if (!hasChanged) return;

      const entries = Object.entries(callLineStates.current);
      const index = entries.findIndex(([id]) => id === callId) + 1;

      if (
        websocket &&
        websocket.readyState === WebSocket.OPEN &&
        !isGlobalMute
      ) {
        console.log("Sending CALL_UPDATE");
        websocket.send(
          JSON.stringify({
            type: "CALL_UPDATE",
            callId,
            index,
            ...data,
          })
        );
      }
    },
    [websocket]
  );

  const deregisterCall = useCallback((callId: string) => {
    delete callLineStates.current[callId];
  }, []);

  return { registerCallList, deregisterCall };
}
