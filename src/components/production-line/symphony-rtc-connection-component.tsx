import { TJoinProductionOptions } from "./types";
import { TGlobalStateAction } from "../../global-state/global-state-actions";
import { useEstablishSession } from "./use-establish-session";
import { useRtcConnection } from "./use-rtc-connection";
import { useHeartbeat } from "./use-heartbeat";
import { TUseAudioInputValues } from "./use-audio-input";
import { useCallStateSync } from "./use-call-state-sync";

type SymphonyRtcConnectionComponentProps = {
  joinProductionOptions: TJoinProductionOptions | null;
  audiooutput: string | undefined;
  inputAudioStream: TUseAudioInputValues;
  callId: string;
  dispatch: React.Dispatch<TGlobalStateAction>;
};

export const SymphonyRtcConnectionComponent = ({
  joinProductionOptions,
  audiooutput,
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
    audiooutput,
    sessionId,
    callId,
  });

  useHeartbeat({ sessionId });

  // Sync all state properties with the global state
  useCallStateSync({
    callId,
    dispatch,
    stateUpdates: {
      connectionState,
      audioElements,
      sessionId,
    },
  });

  return null;
};
