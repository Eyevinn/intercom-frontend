import { useEffect } from "react";
import { TJoinProductionOptions } from "./types";
import { TGlobalStateAction } from "../../global-state/global-state-actions";
import { useEstablishSession } from "./use-establish-session";
import { useRtcConnection } from "./use-rtc-connection";
import { useHeartbeat } from "./use-heartbeat";
import { TUseAudioInputValues } from "./use-audio-input";

type SymphonyRtcConnectionComponentProps = {
  joinProductionOptions: TJoinProductionOptions | null;
  audiooutput: string | undefined;
  inputAudioStream: TUseAudioInputValues;
  callId: string;
  dispatch: React.Dispatch<TGlobalStateAction>;
  isIframe?: boolean;
};

export const SymphonyRtcConnectionComponent = ({
  joinProductionOptions,
  audiooutput,
  inputAudioStream,
  callId,
  dispatch,
  isIframe = false,
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
    audiooutput,
    sessionId,
    callId,
  });

  useHeartbeat({ sessionId });

  // Update local state
  useEffect(() => {
    console.log("[SymphonyRtcConnection] connectionState:", connectionState);

    // Update local state
    dispatch({
      type: "UPDATE_CALL",
      payload: {
        id: callId,
        updates: {
          connectionState,
        },
      },
    });

    // If we're in an iframe, send update to parent
    if (isIframe) {
      window.parent.postMessage(
        {
          type: "RTC_STATE_UPDATE",
          data: {
            callId,
            connectionState,
            // Don't send audioElements as they contain DOM elements
            sessionId,
          },
        },
        "*"
      );
    }
  }, [callId, connectionState, sessionId, dispatch, isIframe]);

  // Update audioElements in state separately
  useEffect(() => {
    if (audioElements) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: {
            audioElements,
          },
        },
      });

      // For iframe, we can't send the actual DOM elements
      // Instead, we could send metadata about the audio elements if needed
      if (isIframe) {
        // Send only the count or other serializable metadata
        window.parent.postMessage(
          {
            type: "AUDIO_ELEMENTS_UPDATE",
            data: {
              callId,
              audioElementsCount: audioElements.length,
            },
          },
          "*"
        );
      }
    }
  }, [audioElements, callId, dispatch, isIframe]);

  return null;
};
