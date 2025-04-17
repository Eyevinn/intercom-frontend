import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { noop } from "../../helpers";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions } from "./types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";
import { TUseAudioInputValues } from "./use-audio-input.ts";
import { startRtcStatInterval } from "./rtc-stat-interval.ts";
import { isBrowserSafari, isIpad, isMobile } from "../../bowser.ts";
import logger from "../../utils/logger.ts";

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
  const onRtcTrack = ({ streams }: RTCTrackEvent) => {
    // We can count on there being only a single stream per event for now.
    const selectedStream = streams[0];

    if (selectedStream && selectedStream.getAudioTracks().length !== 0) {
      const audioElement = new Audio();

      // Add a unique identifier
      const lineId = joinProductionOptions.lineId || "unknown";
      audioElement.id = `rtc-audio-${lineId}-${Date.now()}`;

      audioElement.controls = false;
      audioElement.autoplay = true;
      audioElement.onerror = () => {
        dispatch({
          type: "ERROR",
          payload: {
            callId,
            error: new Error(
              `Audio Error: ${audioElement.error?.code} - ${audioElement.error?.message}`
            ),
          },
        });
      };

      audioElement.srcObject = selectedStream;

      setAudioElements((prevArray) => [audioElement, ...prevArray]);
      if (audiooutput && (!isBrowserSafari || !isMobile || !isIpad)) {
        audioElement.setSinkId(audiooutput).catch((e) => {
          dispatch({
            type: "ERROR",
            payload: {
              callId,
              error:
                e instanceof Error
                  ? e
                  : new Error("Error assigning audio sink."),
            },
          });
        });
      }
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

  // Listen to incoming audio streams and attach them to a HTMLAudioElement
  rtcPeerConnection.addEventListener("track", onRtcTrack);

  // Set up a data channel
  const dataChannel = rtcPeerConnection.createDataChannel(
    "conference-data-channel",
    {
      ordered: true,
    }
  );

  dispatch({
    type: "UPDATE_CALL",
    payload: {
      id: callId,
      updates: {
        dataChannel,
      },
    },
  });

  const onDataChannelMessage = ({ data }: MessageEvent) => {
    let message: unknown;

    try {
      message = JSON.parse(data);
    } catch (e) {
      logger.red(`Error parsing data channel message: ${e}`);
    }

    if (
      message &&
      typeof message === "object" &&
      "type" in message &&
      message.type === "DominantSpeaker" &&
      "endpoint" in message &&
      typeof message.endpoint === "string"
    ) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: {
            dominantSpeaker: message.endpoint,
          },
        },
      });
    } else if (
      message &&
      typeof message === "object" &&
      "type" in message &&
      message.type === "EndpointMessage" &&
      "payload" in message &&
      "to" in message &&
      "from" in message &&
      message.payload &&
      typeof message.payload === "object" &&
      "muteParticipant" in message.payload &&
      typeof message.payload.muteParticipant === "string"
    ) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: {
            isRemotelyMuted:
              message.payload.muteParticipant === "mute" &&
              message.to !== message.from,
          },
        },
      });
    } else {
      logger.red("Unexpected data channel message structure");
    }
  };

  // Listen for data channel messages to parse dominant speaker
  dataChannel.addEventListener("message", onDataChannelMessage);

  // Promisified "icegatherstatechange" listener for use with async/await
  const iceGatheringComplete = (): Promise<void> =>
    new Promise((resolve, reject) => {
      let timeout: number | null = null;

      const cb = () => {
        if (rtcPeerConnection.iceGatheringState === "complete") {
          rtcPeerConnection.removeEventListener("icegatheringstatechange", cb);

          if (timeout !== null) {
            window.clearTimeout(timeout);
          }

          resolve();
        }
      };

      timeout = window.setTimeout(() => {
        rtcPeerConnection.removeEventListener("icegatheringstatechange", cb);
        reject(new Error("ice gathering timeout (waited 5 seconds)"));
      }, 5000);

      rtcPeerConnection.addEventListener("icegatheringstatechange", cb);
    });

  const startConnecting = async () => {
    // TODO handle checking if production view was closed in-between each await here, for rock solid async behaviour
    await rtcPeerConnection.setRemoteDescription({
      sdp: sdpOffer,
      type: "offer",
    });

    const sdpAnswer = await rtcPeerConnection.createAnswer();

    if (!sdpAnswer.sdp) {
      throw new Error("No sdp in answer");
    }

    await rtcPeerConnection.setLocalDescription(sdpAnswer);

    await iceGatheringComplete();

    logger.cyan("sdp PATCH sent");

    await API.patchAudioSession({
      sessionId,
      sdpAnswer: sdpAnswer.sdp,
    });
  };

  startConnecting().catch((e) => {
    rtcPeerConnection.close();
    // TODO it's possible view is closed while user is connecting,
    // handle checking if component was unmounted and ignore error.
    logger.red(`Error starting connection: ${e}`);

    dispatch({
      type: "ERROR",
      payload: {
        callId,
        error: e,
      },
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
  const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);
  const [noStreamError, setNoStreamError] = useState(false);
  const audioElementsRef = useRef<HTMLAudioElement[]>(audioElements);
  const navigate = useNavigate();

  // Use a ref to make sure we only clean up
  // audio elements once, and not every time
  // the array is updated.
  useEffect(() => {
    audioElementsRef.current = audioElements;
  }, [audioElements]);

  const cleanUpAudio = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      el.pause();
      // eslint-disable-next-line no-param-reassign
      el.srcObject = null;
    });
  }, [audioElementsRef]);

  // Teardown
  useEffect(
    () => () => {
      cleanUpAudio();
    },
    [cleanUpAudio]
  );

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

    // Input Audio Stream is optional, but it should generally
    // exist as long as the device has an input option available.
    if (inputAudioStream !== "no-device") {
      attachInputAudioToPeerConnection({
        rtcPeerConnection,
        inputAudioStream,
      });

      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id: callId,
          updates: {
            mediaStreamInput: inputAudioStream,
          },
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
    cleanUpAudio,
    dispatch,
    noStreamError,
    callId,
  ]);

  // Debug hook for logging RTC events TODO remove
  useEffect(() => {
    const onIceGathering = () =>
      logger.cyan(`ice gathering: ${rtcPeerConnection.iceGatheringState}`);
    const onIceConnection = () =>
      logger.cyan(`ice connection: ${rtcPeerConnection.iceConnectionState}`);
    const onConnection = () =>
      logger.cyan(`rtc connection: ${rtcPeerConnection.connectionState}`);
    const onSignaling = () =>
      logger.cyan(`rtc signaling: ${rtcPeerConnection.signalingState}`);
    const onIceCandidate = () => logger.cyan("ice candidate requested");
    const onIceCandidateError = () => logger.cyan("ice candidate error");
    const onNegotiationNeeded = () => logger.cyan("negotiation needed");

    rtcPeerConnection.addEventListener(
      "icegatheringstatechange",
      onIceGathering
    );
    rtcPeerConnection.addEventListener(
      "iceconnectionstatechange",
      onIceConnection
    );
    rtcPeerConnection.addEventListener("connectionstatechange", onConnection);
    rtcPeerConnection.addEventListener("signalingstatechange", onSignaling);
    rtcPeerConnection.addEventListener("icecandidate", onIceCandidate);
    rtcPeerConnection.addEventListener(
      "icecandidateerror",
      onIceCandidateError
    );
    rtcPeerConnection.addEventListener(
      "negotiationneeded",
      onNegotiationNeeded
    );

    return () => {
      rtcPeerConnection.removeEventListener(
        "icegatheringstatechange",
        onIceGathering
      );
      rtcPeerConnection.removeEventListener(
        "iceconnectionstatechange",
        onIceConnection
      );
      rtcPeerConnection.removeEventListener(
        "connectionstatechange",
        onConnection
      );
      rtcPeerConnection.removeEventListener(
        "signalingstatechange",
        onSignaling
      );
      rtcPeerConnection.removeEventListener("icecandidate", onIceCandidate);
      rtcPeerConnection.removeEventListener(
        "icecandidateerror",
        onIceCandidateError
      );
      rtcPeerConnection.removeEventListener(
        "negotiationneeded",
        onNegotiationNeeded
      );
    };
  }, [rtcPeerConnection]);

  return { connectionState, audioElements };
};
