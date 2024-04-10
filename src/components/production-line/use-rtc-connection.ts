import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { noop } from "../../helpers";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions } from "./types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";
import { TUseAudioInputValues } from "./use-audio-input.ts";

type TRtcConnectionOptions = {
  inputAudioStream: TUseAudioInputValues;
  sdpOffer: string | null;
  joinProductionOptions: TJoinProductionOptions | null;
  sessionId: string | null;
};

type TEstablishConnection = {
  rtcPeerConnection: RTCPeerConnection;
  sdpOffer: string;
  joinProductionOptions: TJoinProductionOptions;
  sessionId: string;
  dispatch: Dispatch<TGlobalStateAction>;
  setAudioElements: Dispatch<SetStateAction<HTMLAudioElement[]>>;
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
  sessionId,
  dispatch,
  setAudioElements,
}: TEstablishConnection): { teardown: () => void } => {
  const onRtcTrack = ({ streams }: RTCTrackEvent) => {
    // We can count on there being only a single stream per event for now.
    const selectedStream = streams[0];

    if (selectedStream && selectedStream.getAudioTracks().length !== 0) {
      const audioElement = new Audio();

      audioElement.controls = false;
      audioElement.autoplay = true;
      audioElement.onerror = () => {
        dispatch({
          type: "ERROR",
          payload: new Error(
            `Audio Error: ${audioElement.error?.code} - ${audioElement.error?.message}`
          ),
        });
      };

      audioElement.srcObject = selectedStream;

      setAudioElements((prevArray) => [audioElement, ...prevArray]);
    } else {
      // TODO handle error case of 0 available streams
    }
  };

  // Listen to incoming audio streams and attach them to a HTMLAudioElement
  rtcPeerConnection.addEventListener("track", onRtcTrack);

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

    console.log("sdp PATCH sent");

    await API.patchAudioSession({
      productionId: parseInt(joinProductionOptions.productionId, 10),
      lineId: parseInt(joinProductionOptions.lineId, 10),
      sessionId,
      sdpAnswer: sdpAnswer.sdp,
    });
  };

  startConnecting().catch((e) => {
    rtcPeerConnection.close();
    // TODO it's possible view is closed while user is connecting,
    // handle checking if component was unmounted and ignore error.
    console.error(e);

    dispatch({
      type: "ERROR",
      payload: e,
    });
  });

  return {
    teardown: () => {
      rtcPeerConnection.removeEventListener("track", onRtcTrack);
    },
  };
};

export const useRtcConnection = ({
  inputAudioStream,
  sdpOffer,
  joinProductionOptions,
  sessionId,
}: TRtcConnectionOptions) => {
  const [rtcPeerConnection] = useState<RTCPeerConnection>(
    () => new RTCPeerConnection()
  );
  const [, dispatch] = useGlobalState();
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);

  // Teardown
  useEffect(
    () => () => {
      audioElements.forEach((el) => {
        console.log("Tearing down audio element");
        el.pause();
        // eslint-disable-next-line no-param-reassign
        el.srcObject = null;
      });
    },
    [audioElements]
  );

  useEffect(() => {
    if (
      !sdpOffer ||
      !sessionId ||
      !joinProductionOptions ||
      !inputAudioStream
    ) {
      return noop;
    }

    console.log("Setting up RTC Peer Connection");

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
    }

    const { teardown } = establishConnection({
      rtcPeerConnection,
      sdpOffer,
      joinProductionOptions,
      sessionId,
      dispatch,
      setAudioElements,
    });

    return () => {
      teardown();

      rtcPeerConnection.removeEventListener(
        "connectionstatechange",
        onConnectionStateChange
      );

      rtcPeerConnection.close();
    };
  }, [
    sdpOffer,
    inputAudioStream,
    sessionId,
    joinProductionOptions,
    rtcPeerConnection,
    dispatch,
  ]);

  // Debug hook for logging RTC events TODO remove
  useEffect(() => {
    const onIceGathering = () =>
      console.log("ice gathering:", rtcPeerConnection.iceGatheringState);
    const onIceConnection = () =>
      console.log("ice connection:", rtcPeerConnection.iceConnectionState);
    const onConnection = () =>
      console.log("rtc connection", rtcPeerConnection.connectionState);
    const onSignaling = () =>
      console.log("rtc signaling", rtcPeerConnection.signalingState);
    const onIceCandidate = () => console.log("ice candidate requested");
    const onIceCandidateError = () => console.log("ice candidate error");
    const onNegotiationNeeded = () => console.log("negotiation needed");

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
