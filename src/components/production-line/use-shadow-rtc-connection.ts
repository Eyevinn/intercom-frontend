/**
 * Self-contained hook that manages a "shadow" WebRTC session for a sibling
 * program-output line without touching global state, dispatch, or navigation.
 *
 * Used by ProductionLine when the user joins a videoEnabled line whose
 * production also contains a programOutputLine — the shadow connection
 * receives the WHIP return feed on that line and surfaces it as plain
 * audioElements / videoElements so the UI can render the Return Feed section.
 */

import { useEffect } from "react";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";
import logger from "../../utils/logger.ts";
import { TJoinProductionOptions } from "./types.ts";
import { useAudioElements } from "./use-audio-elements.ts";
import { useVideoElements } from "./use-video-elements.ts";
import { createAudioElement } from "./audio-element-factory.ts";
import { createVideoElement } from "./video-element-factory.ts";
import { waitForIceGathering } from "./ice-gathering.ts";

export const useShadowRtcConnection = (
  shadowOptions: TJoinProductionOptions | null
): { audioElements: HTMLAudioElement[]; videoElements: HTMLVideoElement[] } => {
  const { audioElements, setAudioElements, cleanUpAudio } = useAudioElements();
  const { videoElements, setVideoElements, cleanUpVideo } = useVideoElements();

  useEffect(() => {
    if (!shadowOptions) return noop;

    const { productionId, lineId, username } = shadowOptions;
    let aborted = false;
    let rtcPeerConnection: RTCPeerConnection | null = null;
    let heartbeatInterval: number | null = null;
    let sessionIdForCleanup: string | null = null;

    const teardown = () => {
      aborted = true;

      if (heartbeatInterval !== null) {
        window.clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      if (rtcPeerConnection) {
        rtcPeerConnection.close();
        rtcPeerConnection = null;
      }

      if (sessionIdForCleanup) {
        API.deleteAudioSession({ sessionId: sessionIdForCleanup }).catch(
          logger.red
        );
        sessionIdForCleanup = null;
      }

      // Pause and clear all managed media elements so they don't linger when
      // shadowOptions changes (e.g. user leaves line).
      cleanUpAudio();
      setAudioElements([]);
      cleanUpVideo();
      setVideoElements([]);
    };

    const connect = async () => {
      // 1. Request an SDP offer for the shadow line.
      const { sdp: sdpOffer, sessionId } = await API.offerAudioSession({
        productionId: parseInt(productionId, 10),
        lineId: parseInt(lineId, 10),
        username,
      });

      if (aborted) {
        API.deleteAudioSession({ sessionId }).catch(logger.red);
        return;
      }

      sessionIdForCleanup = sessionId;

      // 2. Create the peer connection (receive-only — no local tracks added).
      rtcPeerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // 3. Handle incoming tracks from the WHIP publisher.
      rtcPeerConnection.addEventListener(
        "track",
        ({ streams, track }: RTCTrackEvent) => {
          if (aborted) return;

          if (track.kind === "audio") {
            const stream = streams[0];
            if (!stream) return;
            const el = createAudioElement({
              stream,
              lineId,
              audiooutput: undefined,
              onError: (e) => logger.red(`Shadow audio error: ${e.message}`),
              onSinkError: (e) => logger.red(`Shadow sink error: ${e.message}`),
            });
            setAudioElements((prev) => [el, ...prev]);
          } else if (track.kind === "video") {
            // In forwarder relay mode streams[0] can be undefined; wrap the
            // track in a new MediaStream in that case.
            const stream = streams[0] ?? new MediaStream([track]);
            setVideoElements((prev) => {
              // Deduplicate: skip if we already have this stream or track.
              if (
                prev.some(
                  (el) =>
                    el.srcObject === stream ||
                    (el.srcObject instanceof MediaStream &&
                      el.srcObject.getTracks().some((t) => t.id === track.id))
                )
              ) {
                return prev;
              }

              const endpointId = streams[0]?.id ?? null;
              const el = createVideoElement({ stream, lineId, endpointId });

              // Remove tile when the remote track ends.
              const remove = () => {
                setVideoElements((cur) => cur.filter((e) => e !== el));
                el.pause();
                el.srcObject = null;
              };

              track.addEventListener("ended", remove);

              if (stream instanceof MediaStream) {
                stream.addEventListener("removetrack", (ev) => {
                  if (ev.track.id === track.id) remove();
                });
              }

              return [el, ...prev];
            });
          }
        }
      );

      // 4. Negotiate: set remote offer, create answer, set local description.
      await rtcPeerConnection.setRemoteDescription({
        sdp: sdpOffer,
        type: "offer",
      });

      const answer = await rtcPeerConnection.createAnswer();
      if (!answer.sdp) throw new Error("No sdp in shadow answer");
      await rtcPeerConnection.setLocalDescription(answer);

      // 5. Wait for ICE candidates to be gathered.
      await waitForIceGathering(rtcPeerConnection);

      if (aborted) return;

      // 6. Send the completed answer to the backend.
      await API.patchAudioSession({ sessionId, sdpAnswer: answer.sdp });

      if (aborted) return;

      // 7. Start heartbeat to keep the session alive.
      heartbeatInterval = window.setInterval(() => {
        API.heartbeat({ sessionId }).catch((err) => {
          logger.red(`Shadow heartbeat error for session ${sessionId}: ${err}`);
        });
      }, 10_000);
    };

    connect().catch((err) => {
      if (!aborted) {
        logger.red(`Shadow RTC connection failed: ${err}`);
      }
    });

    return teardown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadowOptions]);

  return { audioElements, videoElements };
};
