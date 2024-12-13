import { useEffect } from "react";
import { TJoinProductionOptions } from "./types";
import { TGlobalStateAction } from "../../global-state/global-state-actions";
import { useEstablishSession } from "./use-establish-session";
import { useRtcConnection } from "./use-rtc-connection";
import { useHeartbeat } from "./use-heartbeat";
import { TUseAudioInputValues } from "./use-audio-input";

type SymphonyRtcConnectionComponentProps = {
  joinProductionOptions: TJoinProductionOptions | null;
  inputAudioStream: TUseAudioInputValues;
  callId: string;
  dispatch: React.Dispatch<TGlobalStateAction>;
};

export const SymphonyRtcConnectionComponent = ({
  joinProductionOptions,
  inputAudioStream,
  callId,
  dispatch,
}: SymphonyRtcConnectionComponentProps) => {
  const { sessionId, sdpOffer } = useEstablishSession({
    joinProductionOptions,
    callId,
    dispatch,
  });

  const { connectionState, audioElements } = useRtcConnection({
    inputAudioStream,
    sdpOffer,
    joinProductionOptions,
    sessionId,
    callId,
  });

  useHeartbeat({ sessionId });

  useEffect(() => {
    dispatch({
      type: "UPDATE_CALL",
      payload: {
        id: callId,
        updates: {
          connectionState,
        },
      },
    });
  }, [callId, connectionState, dispatch]);

  useEffect(() => {
    dispatch({
      type: "UPDATE_CALL",
      payload: {
        id: callId,
        updates: {
          audioElements,
        },
      },
    });
  }, [audioElements, callId, dispatch]);

  useEffect(() => {
    dispatch({
      type: "UPDATE_CALL",
      payload: {
        id: callId,
        updates: {
          sessionId,
        },
      },
    });
  }, [sessionId, callId, dispatch]);

  return null;
};
