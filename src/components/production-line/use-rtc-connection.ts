import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API } from "../../api/api.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";
import { noop } from "../../helpers";
import logger from "../../utils/logger.ts";
import { createAudioElement } from "./audio-element-factory.ts";
import {
  attachShowWhenReady,
  createVideoElement,
  stopFrameMonitor,
} from "./video-element-factory.ts";
import {
  parseDataChannelMessage,
  isRemoteMute,
} from "./data-channel-parser.ts";
import { waitForIceGathering } from "./ice-gathering.ts";
import { startRtcStatInterval } from "./rtc-stat-interval.ts";
import { TJoinProductionOptions } from "./types.ts";
import { useAudioElements } from "./use-audio-elements.ts";
import { useVideoElements } from "./use-video-elements.ts";
import { TUseAudioInputValues } from "./use-audio-input.ts";
import { TUseVideoInputValues } from "./use-video-input.ts";
import { useRtcDebugLogger } from "./use-rtc-debug-logger.ts";

type TRtcConnectionOptions = {
  inputAudioStream: TUseAudioInputValues;
  inputVideoStream: TUseVideoInputValues;
  videoEnabled: boolean;
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
  setVideoElements: Dispatch<SetStateAction<HTMLVideoElement[]>>;
  setNoStreamError: (input: boolean) => void;
};

type TAttachAudioStream = {
  inputAudioStream: MediaStream;
  rtcPeerConnection: RTCPeerConnection;
};

type TAttachVideoStream = {
  inputVideoStream: MediaStream;
  rtcPeerConnection: RTCPeerConnection;
};

const attachInputAudioToPeerConnection = ({
  inputAudioStream,
  rtcPeerConnection,
}: TAttachAudioStream) => {
  if (rtcPeerConnection.signalingState === "closed") return;
  inputAudioStream
    .getTracks()
    .forEach((track) => rtcPeerConnection.addTrack(track));
};

const VIDEO_MAX_BITRATE = 2_000_000;
const VIDEO_MAX_FRAMERATE = 25;

const applyVideoSenderParameters = async (sender: RTCRtpSender) => {
  const params = sender.getParameters();
  if (!params.encodings || params.encodings.length === 0) {
    params.encodings = [{}];
  }
  params.encodings[0].maxBitrate = VIDEO_MAX_BITRATE;
  params.encodings[0].maxFramerate = VIDEO_MAX_FRAMERATE;
  try {
    await sender.setParameters(params);
  } catch (err) {
    console.warn("[useRtcConnection] setParameters failed", err);
  }
};

const attachInputVideoToPeerConnection = ({
  inputVideoStream,
  rtcPeerConnection,
}: TAttachVideoStream) => {
  if (rtcPeerConnection.signalingState === "closed") return;
  inputVideoStream.getTracks().forEach((track) => {
    const sender = rtcPeerConnection.addTrack(track);
    if (track.kind === "video") applyVideoSenderParameters(sender);
  });
};

const establishConnection = ({
  rtcPeerConnection,
  sdpOffer,
  joinProductionOptions,
  audiooutput,
  sessionId,
  callId,
  dispatch,
  setAudioElements,
  setVideoElements,
  setNoStreamError,
}: TEstablishConnection): { teardown: () => void } => {
  const lineId = joinProductionOptions.lineId || "unknown";

  const onRtcTrack = ({ streams, track }: RTCTrackEvent) => {
    if (track.kind === "audio") {
      const selectedStream = streams[0];
      if (!selectedStream) {
        setNoStreamError(true);
        dispatch({
          type: "ERROR",
          payload: {
            callId,
            error: new Error("Stream-error: No MediaStream available"),
          },
        });
        return;
      }
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
    } else if (track.kind === "video") {
      const selectedStream = streams[0] ?? new MediaStream([track]);
      setVideoElements((prev) => {
        if (
          prev.some(
            (el) =>
              el.srcObject === selectedStream ||
              (el.srcObject instanceof MediaStream &&
                el.srcObject.getTracks().some((t) => t.id === track.id))
          )
        ) {
          return prev;
        }
        const endpointId = streams[0]?.id ?? null;
        const videoElement = createVideoElement({
          stream: selectedStream,
          lineId,
          endpointId,
        });
        const removeThisElement = () => {
          stopFrameMonitor(videoElement);
          setVideoElements((current) =>
            current.filter((el) => el !== videoElement)
          );
          videoElement.pause();
          videoElement.srcObject = null;
        };

        track.addEventListener("ended", removeThisElement);
        track.addEventListener("unmute", () => {
          videoElement.dataset.lastSessionId = "";
          const parent = videoElement.parentElement;
          if (parent) attachShowWhenReady(videoElement, parent);
          videoElement.play().catch(() => {});
          setVideoElements((current) => [...current]);
        });

        if (selectedStream instanceof MediaStream) {
          selectedStream.addEventListener("removetrack", (event) => {
            if (event.track.id === track.id) {
              removeThisElement();
            }
          });
        }

        return [videoElement, ...prev];
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
  inputVideoStream,
  videoEnabled,
  sdpOffer,
  joinProductionOptions,
  audiooutput,
  sessionId,
  callId,
}: TRtcConnectionOptions) => {
  const [rtcPeerConnection] = useState<RTCPeerConnection>(
    () =>
      new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      })
  );
  const [, dispatch] = useGlobalState();
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const { audioElements, setAudioElements } = useAudioElements();
  const { videoElements, setVideoElements } = useVideoElements();
  const [noStreamError, setNoStreamError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (noStreamError) {
      navigate("/");
    }
  }, [navigate, noStreamError, callId]);

  useEffect(() => {
    if (
      !sdpOffer ||
      !sessionId ||
      !joinProductionOptions ||
      !inputAudioStream ||
      (videoEnabled && inputVideoStream === null)
    ) {
      return noop;
    }

    if (rtcPeerConnection.signalingState === "closed") {
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

    if (videoEnabled && inputVideoStream && inputVideoStream !== "no-device") {
      attachInputVideoToPeerConnection({
        rtcPeerConnection,
        inputVideoStream,
      });

      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: { mediaStreamVideoInput: inputVideoStream },
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
      setVideoElements,
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
    inputVideoStream,
    videoEnabled,
    sessionId,
    joinProductionOptions,
    rtcPeerConnection,
    dispatch,
    callId,
  ]);

  useRtcDebugLogger(rtcPeerConnection);

  return { connectionState, audioElements, videoElements };
};
