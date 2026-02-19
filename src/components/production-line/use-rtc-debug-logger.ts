/**
 * Hook that attaches debug event listeners to an RTCPeerConnection and
 * cleans them up on unmount. Extracted from use-rtc-connection.ts lines 412-473.
 * Marked as "TODO remove" in the original source.
 */

import { useEffect } from "react";
import logger from "../../utils/logger.ts";

export const useRtcDebugLogger = (
  rtcPeerConnection: RTCPeerConnection | null
) => {
  useEffect(() => {
    if (!rtcPeerConnection) return undefined;

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
};
