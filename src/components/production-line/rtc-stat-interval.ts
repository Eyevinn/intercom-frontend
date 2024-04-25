import { Dispatch } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";

export const startRtcStatInterval = ({
  rtcPeerConnection,
  dispatch,
}: {
  rtcPeerConnection: RTCPeerConnection;
  dispatch: Dispatch<TGlobalStateAction>;
}) => {
  let ongoingStatsPromise: null | Promise<void | RTCStatsReport> = null;

  const statsInterval = window.setInterval(() => {
    // Do not request new stats if previously requested has not yet resolved
    if (ongoingStatsPromise) return;

    const inboundRtpStats: unknown[] = [];
    const mediaSourceStats: unknown[] = [];

    const audioLevelThreshold = 0.02;

    let isAudioLevelAboveThreshold = false;

    ongoingStatsPromise = rtcPeerConnection.getStats().then((stats) => {
      ongoingStatsPromise = null;

      stats.forEach((stat) => {
        if (stat.type === "inbound-rtp") {
          inboundRtpStats.push(stat);
        }

        if (stat.type === "media-source") {
          mediaSourceStats.push(stat);
        }
      });

      // Check if we have incoming audio above a threshold
      if (inboundRtpStats.length) {
        inboundRtpStats.forEach((inboundStats) => {
          if (
            inboundStats &&
            typeof inboundStats === "object" &&
            "audioLevel" in inboundStats &&
            typeof inboundStats.audioLevel === "number"
          ) {
            if (inboundStats.audioLevel > audioLevelThreshold) {
              isAudioLevelAboveThreshold = true;
            }
          }
        });
      }

      // If no incoming audio, check if we have local audio above a certain threshold
      if (!isAudioLevelAboveThreshold && mediaSourceStats.length) {
        mediaSourceStats.forEach((sourceStats) => {
          if (
            sourceStats &&
            typeof sourceStats === "object" &&
            "audioLevel" in sourceStats &&
            typeof sourceStats.audioLevel === "number"
          ) {
            if (sourceStats.audioLevel > audioLevelThreshold) {
              isAudioLevelAboveThreshold = true;
            }
          }
        });
      }

      dispatch({
        type: "AUDIO_LEVEL_ABOVE_THRESHOLD",
        payload: isAudioLevelAboveThreshold,
      });
    });
  }, 100);

  return () => {
    window.clearInterval(statsInterval);
  };
};
