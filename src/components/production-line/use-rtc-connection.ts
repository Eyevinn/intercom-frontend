import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/api.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";
import { noop } from "../../helpers";
import logger from "../../utils/logger.ts";
import { createAudioElement } from "./audio-element-factory.ts";
import {
  parseDataChannelMessage,
  isRemoteMute,
} from "./data-channel-parser.ts";
import { waitForIceGathering } from "./ice-gathering.ts";
import { startRtcStatInterval } from "./rtc-stat-interval.ts";
import { TJoinProductionOptions } from "./types.ts";
import { useAudioElements } from "./use-audio-elements.ts";
import { TUseAudioInputValues } from "./use-audio-input.ts";
import { useRtcDebugLogger } from "./use-rtc-debug-logger.ts";

type TRtcConnectionOptions = {
  inputAudioStream: TUseAudioInputValues;
  sdpOffer: string | null;
  joinProductionOptions: TJoinProductionOptions | null;
  audiooutput: string | undefined;
  sessionId: string | null;
  callId: string;
};

type TEstablishConnection = {
  rtcPeerConnection: RTCPeerConnection;
  sdpOffer: string;
  joinProductionOptions: TJoinProductionOptions;
  audiooutput: string | undefined;
  sessionId: string;
  callId: string;
  dispatch: Dispatch<TGlobalStateAction>;
  setAudioElements: Dispatch<SetStateAction<HTMLAudioElement[]>>;
  setNoStreamError: (input: boolean) => void;
};

type TAttachAudioStream = {
  inputAudioStream: MediaStream;
  rtcPeerConnection: RTCPeerConnection;
};

const attachInputAudioToPeerConnection = ({
  inputAudioStream,
  rtcPeerConnection,
}: TAttachAudioStream) =>
  inputAudioStream
    .getTracks()
    .forEach((track) => rtcPeerConnection.addTrack(track));

const establishConnection = ({
  rtcPeerConnection,
  sdpOffer,
  joinProductionOptions,
  audiooutput,
  sessionId,
  callId,
  dispatch,
  setAudioElements,
  setNoStreamError,
}: TEstablishConnection): { teardown: () => void } => {
  const lineId = joinProductionOptions.lineId || "unknown";

  const onRtcTrack = ({ streams }: RTCTrackEvent) => {
    const selectedStream = streams[0];

    if (selectedStream && selectedStream.getAudioTracks().length !== 0) {
      const audioElement = createAudioElement({
        stream: selectedStream,
        lineId,
        audiooutput,
        onError: (error) => {
          dispatch({ type: "ERROR", payload: { callId, error } });
        },
        onSinkError: (error) => {
          dispatch({ type: "ERROR", payload: { callId, error } });
        },
      });

      setAudioElements((prevArray) => [audioElement, ...prevArray]);
    } else if (selectedStream && selectedStream.getAudioTracks().length === 0) {
      setNoStreamError(true);
      dispatch({
        type: "ERROR",
        payload: {
          callId,
          error: new Error("Stream-error: No MediaStreamTracks avaliable"),
        },
      });
    } else {
      setNoStreamError(true);
      dispatch({
        type: "ERROR",
        payload: {
          callId,
          error: new Error("Stream-error: No MediaStream avaliable"),
        },
      });
    }
  };

  rtcPeerConnection.addEventListener("track", onRtcTrack);

  const dataChannel = rtcPeerConnection.createDataChannel(
    "conference-data-channel",
    { ordered: true }
  );

  dispatch({
    type: "UPDATE_CALL",
    payload: { id: callId, updates: { dataChannel } },
  });

  const onDataChannelMessage = ({ data }: MessageEvent) => {
    const message = parseDataChannelMessage(data);

    if (message.type === "DominantSpeaker") {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: { dominantSpeaker: message.endpoint },
        },
      });
    } else if (message.type === "EndpointMessage") {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: { isRemotelyMuted: isRemoteMute(message) },
        },
      });
    } else {
      logger.red("Unexpected data channel message structure");
    }
  };

  dataChannel.addEventListener("message", onDataChannelMessage);

  const startConnecting = async () => {
    await rtcPeerConnection.setRemoteDescription({
      sdp: sdpOffer,
      type: "offer",
    });

    const sdpAnswer = await rtcPeerConnection.createAnswer();

    if (!sdpAnswer.sdp) {
      throw new Error("No sdp in answer");
    }

    await rtcPeerConnection.setLocalDescription(sdpAnswer);

    await waitForIceGathering(rtcPeerConnection);

    logger.cyan("sdp PATCH sent");

    await API.patchAudioSession({
      sessionId,
      sdpAnswer: sdpAnswer.sdp,
    });
  };

  startConnecting().catch((e) => {
    rtcPeerConnection.close();
    logger.red(`Error starting connection: ${e}`);

    dispatch({
      type: "ERROR",
      payload: { callId, error: e },
    });
  });

  const rtcStatIntervalTeardown = startRtcStatInterval({
    rtcPeerConnection,
    callId,
    dispatch,
  });

  return {
    teardown: () => {
      dataChannel.removeEventListener("message", onDataChannelMessage);
      rtcPeerConnection.removeEventListener("track", onRtcTrack);
      rtcStatIntervalTeardown();
    },
  };
};

export const useRtcConnection = ({
  inputAudioStream,
  sdpOffer,
  joinProductionOptions,
  audiooutput,
  sessionId,
  callId,
}: TRtcConnectionOptions) => {
  const [rtcPeerConnection] = useState<RTCPeerConnection>(
    () => new RTCPeerConnection()
  );
  const [, dispatch] = useGlobalState();
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const { audioElements, setAudioElements } = useAudioElements();
  const [noStreamError, setNoStreamError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (noStreamError) {
      navigate("/");
    }
  }, [navigate, noStreamError]);

  useEffect(() => {
    if (
      !sdpOffer ||
      !sessionId ||
      !joinProductionOptions ||
      !inputAudioStream
    ) {
      return noop;
    }

    logger.cyan("Setting up RTC Peer Connection");

    const onConnectionStateChange = () => {
      setConnectionState(rtcPeerConnection.connectionState);
    };

    rtcPeerConnection.addEventListener(
      "connectionstatechange",
      onConnectionStateChange
    );

    if (inputAudioStream !== "no-device") {
      attachInputAudioToPeerConnection({
        rtcPeerConnection,
        inputAudioStream,
      });

      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: { mediaStreamInput: inputAudioStream },
        },
      });
    }

    const { teardown } = establishConnection({
      rtcPeerConnection,
      sdpOffer,
      joinProductionOptions,
      audiooutput,
      sessionId,
      callId,
      dispatch,
      setAudioElements,
      setNoStreamError,
    });

    return () => {
      teardown();

      rtcPeerConnection.removeEventListener(
        "connectionstatechange",
        onConnectionStateChange
      );

      rtcPeerConnection.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sdpOffer,
    inputAudioStream,
    sessionId,
    joinProductionOptions,
    rtcPeerConnection,
    dispatch,
    noStreamError,
    callId,
  ]);

  // Debug hook for logging RTC events TODO remove
  useRtcDebugLogger(rtcPeerConnection);

  return { connectionState, audioElements };
};
