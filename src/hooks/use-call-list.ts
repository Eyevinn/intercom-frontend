import { useCallback, useEffect, useRef } from "react";

export type CallData = {
  isInputMuted: boolean;
  isOutputMuted: boolean;
  volume: number;
  lineId: string;
  lineName: string;
  productionId: string;
  productionName: string;
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
  const hasRegisteredCallRef = useRef(false);

  const sendCallsStateUpdate = useCallback(
    (force = false) => {
      const entries = Object.entries(callLineStates.current);
      if (entries.length === 0) return;

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
        (force || serialized !== lastSentCallsState.current)
      ) {
        websocket.send(serialized);
        lastSentCallsState.current = serialized;
      }
    },
    [websocket]
  );

  useEffect(() => {
    if (
      websocket &&
      websocket.readyState === WebSocket.OPEN &&
      Object.keys(callLineStates.current).length > 0
    ) {
      hasRegisteredCallRef.current = true;
      sendCallsStateUpdate(true);
    }
  }, [websocket, sendCallsStateUpdate]);

  useEffect(() => {
    globalMuteRef.current = globalMute;
    numberOfCallsRef.current = numberOfCalls;
    if (hasRegisteredCallRef.current) {
      sendCallsStateUpdate();
    }
  }, [globalMute, numberOfCalls, sendCallsStateUpdate]);

  const registerCallList = useCallback(
    (callId: string, data: CallData, isSettingGlobalMute?: boolean) => {
      const prev = callLineStates.current[callId];
      const isNewCall = prev === undefined;

      callLineStates.current[callId] = data;
      hasRegisteredCallRef.current = true;

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
        !isSettingGlobalMute
      ) {
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

  const resetLastSentCallsState = () => {
    lastSentCallsState.current = "";
  };

  return {
    registerCallList,
    deregisterCall,
    sendCallsStateUpdate,
    resetLastSentCallsState,
  };
}
