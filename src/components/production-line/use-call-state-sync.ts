import { useEffect } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions";

type TStateUpdates = {
  connectionState: RTCPeerConnectionState | null;
  audioElements: HTMLAudioElement[];
  sessionId: string | null;
};

interface UseCallStateSyncProps {
  callId: string;
  dispatch: React.Dispatch<TGlobalStateAction>;
  stateUpdates: TStateUpdates;
}

export const useCallStateSync = ({
  callId,
  dispatch,
  stateUpdates,
}: UseCallStateSyncProps) => {
  // Individual effects for each property
  useEffect(() => {
    if (stateUpdates.connectionState !== null) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: { connectionState: stateUpdates.connectionState },
        },
      });
    }
  }, [stateUpdates.connectionState, callId, dispatch]);

  useEffect(() => {
    dispatch({
      type: "UPDATE_CALL",
      payload: {
        id: callId,
        updates: { audioElements: stateUpdates.audioElements },
      },
    });
  }, [stateUpdates.audioElements, callId, dispatch]);

  useEffect(() => {
    if (stateUpdates.sessionId !== null) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: { sessionId: stateUpdates.sessionId },
        },
      });
    }
  }, [stateUpdates.sessionId, callId, dispatch]);
};
