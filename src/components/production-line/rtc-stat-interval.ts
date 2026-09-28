import { Dispatch } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";

const AUDIO_LEVEL_THRESHOLD = 0.02;

/**
 * Pure helper that extracts the highest `audioLevel` found across a set of
 * getStats() entries of a given type. Returns null when no numeric audioLevel
 * is present. Extracted so the threshold logic can be unit tested without a
 * real RTCPeerConnection (not available in happy-dom).
 */
export const getMaxAudioLevel = (stats: unknown[]): number | null => {
  let max: number | null = null;

  stats.forEach((stat) => {
    if (
      stat &&
      typeof stat === "object" &&
      "audioLevel" in stat &&
      typeof stat.audioLevel === "number"
    ) {
      if (max === null || stat.audioLevel > max) {
        max = stat.audioLevel;
      }
    }
  });

  return max;
};

/**
 * Reads the current RMS audio level (0..1) from an AnalyserNode. This is
 * derived directly from the decoded remote MediaStream and is therefore
 * independent of the <audio> element's muted/volume state. On Chromium the
 * inbound-rtp `audioLevel` stat drops to ~0 when the sink is muted, so this
 * analyser value is used as a fallback to keep the speaking indicator alive.
 */
export const readAnalyserLevel = (
  analyser: AnalyserNode,
  buffer: Uint8Array<ArrayBuffer>
): number => {
  analyser.getByteTimeDomainData(buffer);

  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    // Convert 0..255 (centered at 128) to -1..1
    const sample = (buffer[i] - 128) / 128;
    sumSquares += sample * sample;
  }

  return Math.sqrt(sumSquares / buffer.length);
};

type TAnalyserContext = {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  buffer: Uint8Array<ArrayBuffer>;
};

/**
 * Taps a WebAudio AnalyserNode onto a remote MediaStream. The source is not
 * connected to the audio context destination, so it does not affect playout
 * and is not affected by the <audio> element's muted/volume. Returns null if
 * WebAudio is unavailable (e.g. in the happy-dom test environment).
 */
const createAnalyserContext = (
  stream: MediaStream
): TAnalyserContext | null => {
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) return null;

  try {
    const audioContext = new AudioContextCtor();

    // Browsers auto-suspend an AudioContext created without a user gesture.
    // A suspended context does not process audio, so the analyser would always
    // read silence and the muted-speaker activity feedback would never fire.
    // Resume it (best-effort) so the analyser reflects the live stream.
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {
        // Ignore resume rejections (e.g. missing user gesture); the context
        // will resume on the next successful attempt.
      });
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const buffer = new Uint8Array(new ArrayBuffer(analyser.fftSize));

    return { audioContext, analyser, source, buffer };
  } catch {
    return null;
  }
};

export const startRtcStatInterval = ({
  rtcPeerConnection,
  callId,
  dispatch,
  getRemoteStream,
}: {
  rtcPeerConnection: RTCPeerConnection;
  callId: string;
  dispatch: Dispatch<TGlobalStateAction>;
  getRemoteStream?: () => MediaStream | null;
}) => {
  let ongoingStatsPromise: null | Promise<void | RTCStatsReport> = null;
  let previousState = false;
  let analyserContext: TAnalyserContext | null = null;

  const ensureAnalyserContext = (): TAnalyserContext | null => {
    if (analyserContext) return analyserContext;

    const stream = getRemoteStream?.() ?? null;
    if (!stream || stream.getAudioTracks().length === 0) return null;

    analyserContext = createAnalyserContext(stream);
    return analyserContext;
  };

  const statsInterval = window.setInterval(() => {
    // Do not request new stats if previously requested has not yet resolved
    if (ongoingStatsPromise) return;

    const inboundRtpStats: unknown[] = [];
    const mediaSourceStats: unknown[] = [];

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
      const inboundLevel = getMaxAudioLevel(inboundRtpStats);
      if (inboundLevel !== null && inboundLevel > AUDIO_LEVEL_THRESHOLD) {
        isAudioLevelAboveThreshold = true;
      }

      // On Chromium the inbound-rtp audioLevel drops to ~0 when the speaker
      // (audio element) is muted or its volume is 0, which kills the speaking
      // indicator. Fall back to a WebAudio analyser tapped directly on the
      // remote stream, which is independent of local playout muting.
      if (!isAudioLevelAboveThreshold) {
        const context = ensureAnalyserContext();
        if (context) {
          const analyserLevel = readAnalyserLevel(
            context.analyser,
            context.buffer
          );
          if (analyserLevel > AUDIO_LEVEL_THRESHOLD) {
            isAudioLevelAboveThreshold = true;
          }
        }
      }

      // If no incoming audio, check if we have local audio above a certain threshold
      if (!isAudioLevelAboveThreshold) {
        const sourceLevel = getMaxAudioLevel(mediaSourceStats);
        if (sourceLevel !== null && sourceLevel > AUDIO_LEVEL_THRESHOLD) {
          isAudioLevelAboveThreshold = true;
        }
      }

      if (previousState !== isAudioLevelAboveThreshold) {
        previousState = isAudioLevelAboveThreshold;

        dispatch({
          type: "UPDATE_CALL",
          payload: {
            id: callId,
            updates: {
              audioLevelAboveThreshold: isAudioLevelAboveThreshold,
            },
          },
        });
      }
    });
  }, 100);

  return () => {
    window.clearInterval(statsInterval);

    if (analyserContext) {
      try {
        analyserContext.source.disconnect();
        analyserContext.analyser.disconnect();
        analyserContext.audioContext.close();
      } catch {
        // Ignore teardown errors on already-closed contexts.
      }
      analyserContext = null;
    }
  };
};
