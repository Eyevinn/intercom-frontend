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
  // Create an effect for each state property that needs to be synced
  Object.entries(stateUpdates).forEach(([key, value]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: {
            [key]: value,
          },
        },
      });
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  });
};
