import { useEffect, useState } from "react";
import { noop } from "../../helpers";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions } from "./types.ts";

type TRtcConnectionOptions = {
  inputAudioStream: MediaStream | null;
  sdpOffer: string | null;
  joinProductionOptions: TJoinProductionOptions | null;
  sessionId: string | null;
  audioElement: HTMLAudioElement;
};

type TEstablishConnection = {
  rtcPeerConnection: RTCPeerConnection;
  sdpOffer: string;
  joinProductionOptions: TJoinProductionOptions;
  sessionId: string;
  audioElement: HTMLAudioElement;
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
  audioElement,
}: TEstablishConnection): { teardown: () => void } => {
  const onRtcTrack = ({ streams }: RTCTrackEvent) => {
    // We can count on there being only a single stream for now.
    // Needs updating if a video stream is also added.
    const selectedStream = streams[0];

    if (selectedStream) {
      if (selectedStream.getAudioTracks().length !== 0) {
        // Add incoming stream to output audio element
        // eslint-disable-next-line no-param-reassign
        audioElement.srcObject = selectedStream;
      }
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
    // TODO publish error
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
  audioElement,
}: TRtcConnectionOptions) => {
  const [rtcPeerConnection] = useState<RTCPeerConnection>(
    new RTCPeerConnection()
  );
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);

  useEffect(() => {
    if (
      !inputAudioStream ||
      !sdpOffer ||
      !sessionId ||
      !joinProductionOptions
    ) {
      return noop;
    }

    const onConnectionStateChange = () => {
      setConnectionState(rtcPeerConnection.connectionState);
    };

    rtcPeerConnection.addEventListener(
      "connectionstatechange",
      onConnectionStateChange
    );

    attachInputAudioToPeerConnection({
      rtcPeerConnection,
      inputAudioStream,
    });

    const { teardown } = establishConnection({
      rtcPeerConnection,
      sdpOffer,
      joinProductionOptions,
      sessionId,
      audioElement,
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
    audioElement,
  ]);

  return { connectionState };
};
