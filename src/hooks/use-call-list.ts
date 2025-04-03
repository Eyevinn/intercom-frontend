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
  const lastSentState = useRef<string>("");

  const globalMuteRef = useRef(globalMute);
  const numberOfCallsRef = useRef(numberOfCalls);

  useEffect(() => {
    globalMuteRef.current = globalMute;
  }, [globalMute]);

  useEffect(() => {
    numberOfCallsRef.current = numberOfCalls;
  }, [numberOfCalls]);

  const registerCallList = useCallback(
    (callId: string, data: CallData) => {
      callLineStates.current[callId] = data;

      const payload = {
        globalMute: globalMuteRef.current,
        numberOfCalls: numberOfCallsRef.current,
        calls: Object.entries(callLineStates.current).map(([, state]) => ({
          callId,
          ...state,
        })),
      };

      const serialized = JSON.stringify(payload);

      if (
        websocket &&
        websocket.readyState === WebSocket.OPEN &&
        serialized !== lastSentState.current
      ) {
        websocket.send(serialized);
        lastSentState.current = serialized;
        console.log("Sent updated call state:", payload);
      }
    },
    [websocket]
  );

  const deregisterCall = useCallback((callId: string) => {
    delete callLineStates.current[callId];
  }, []);

  return { registerCallList, deregisterCall };
}

// export function useCallList() {
//     const callLineStates = useRef<Record<string, CallData>>({});

//     const updateCallState = useCallback(
//       (callId: string, data: CallData) => {
//         callLineStates.current[callId] = data;
//       },
//       []
//     );

//     const getCallListSnapshot = useCallback(() => {
//       return callLineStates.current;
//     }, []);

//     return {
//       updateCallState,
//       getCallListSnapshot,
//     };
//   }
