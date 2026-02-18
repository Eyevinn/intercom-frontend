import { useCallback, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider.tsx";
import { API } from "../api/api.ts";
import { TP2PCall } from "../global-state/global-state-actions.ts";

/**
 * Hook for managing P2P directed calls.
 *
 * As CALLER:
 * 1. User clicks call button → initiateCall(calleeId)
 * 2. POST /call → get SDP offer
 * 3. Create RTCPeerConnection, set remote desc, create answer
 * 4. PATCH /call/:id → send SDP answer
 * 5. Audio track pre-opened but muted (track.enabled = false)
 * 6. PTT toggles track.enabled
 *
 * As CALLEE (auto, triggered by WebSocket call_incoming):
 * 1. Receive call_incoming event → dispatch CALL_INCOMING
 * 2. POST /call/:id/join → get SDP offer
 * 3. Create RTCPeerConnection, set remote desc, create answer
 * 4. PATCH /call/:id/answer → send SDP answer
 * 5. Audio plays immediately (callee receives, doesn't send)
 */
export function useP2PCalls() {
  const [{ currentClient, websocket, p2pCalls }, dispatch] = useGlobalState();
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const waitForIceGatheringComplete = useCallback((pc: RTCPeerConnection) => {
    if (pc.iceGatheringState === "complete") {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const timeout = window.setTimeout(() => {
        pc.removeEventListener("icegatheringstatechange", onStateChange);
        resolve();
      }, 2500);

      const onStateChange = () => {
        if (pc.iceGatheringState === "complete") {
          window.clearTimeout(timeout);
          pc.removeEventListener("icegatheringstatechange", onStateChange);
          resolve();
        }
      };

      pc.addEventListener("icegatheringstatechange", onStateChange);
    });
  }, []);

  /**
   * Create an RTCPeerConnection and handle incoming audio.
   */
  const createPeerConnection = useCallback(
    (callId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Handle incoming audio tracks
      pc.ontrack = (event: RTCTrackEvent) => {
        const audioElement = new Audio();
        audioElement.srcObject =
          event.streams[0] || new MediaStream([event.track]);
        audioElement.autoplay = true;
        audioElement.playsInline = true;
        audioElement.muted = false;
        audioElement.play().catch(() => {
          // Autoplay might be blocked by browser policy
          console.warn("Audio autoplay blocked for call", callId);
        });

        dispatch({
          type: "UPDATE_P2P_CALL",
          payload: {
            callId,
            updates: { audioElement },
          },
        });
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed"
        ) {
          console.warn(
            `ICE connection ${pc.iceConnectionState} for call ${callId}`
          );
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          dispatch({
            type: "UPDATE_P2P_CALL",
            payload: { callId, updates: { state: "active" } },
          });
        }
      };

      peerConnectionsRef.current.set(callId, pc);
      return pc;
    },
    [dispatch]
  );

  /**
   * Initiate a call to another client (CALLER flow).
   */
  const initiateCall = useCallback(
    async (calleeId: string) => {
      if (!currentClient) return;

      try {
        // 1. POST /call → get SDP offer
        const { callId, sdpOffer, calleeName } =
          await API.initiateCall(calleeId);

        // 2. Create RTCPeerConnection
        const pc = createPeerConnection(callId);

        // Add to state early so call_started events don't get dropped
        const p2pCall: TP2PCall = {
          callId,
          callerId: currentClient.clientId,
          callerName: currentClient.name,
          calleeId,
          calleeName,
          direction: "outgoing",
          state: "setting_up",
          peerConnection: pc,
          audioElement: null,
          isTalking: false,
        };
        dispatch({ type: "SET_P2P_CALL", payload: p2pCall });

        // 3. Add local audio track (pre-opened, muted for PTT)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTrack = stream.getAudioTracks()[0];
        audioTrack.enabled = false; // Start muted, PTT will toggle
        pc.addTrack(audioTrack, stream);

        // 4. Set remote description (SDP offer from server)
        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "offer",
            sdp: sdpOffer,
          })
        );

        // 5. Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // 6. PATCH /call/:id → send SDP answer
        await waitForIceGatheringComplete(pc);
        await API.completeCallerSignaling(callId, answer.sdp!);
      } catch (err) {
        console.error("Failed to initiate call:", err);
        dispatch({
          type: "ERROR",
          payload: { error: new Error(`Failed to initiate call: ${err}`) },
        });
      }
    },
    [currentClient, createPeerConnection, dispatch, waitForIceGatheringComplete]
  );

  /**
   * Handle an incoming call (CALLEE flow, called automatically).
   */
  const handleIncomingCall = useCallback(
    async (callId: string, callerId: string, callerName: string) => {
      if (!currentClient) return;

      try {
        // 1. POST /call/:id/join → get SDP offer
        const { sdpOffer } = await API.joinCall(callId);

        // 2. Create RTCPeerConnection
        const pc = createPeerConnection(callId);

        // 3. Set remote description (SDP offer from server)
        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "offer",
            sdp: sdpOffer,
          })
        );

        // 4. Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // 5. PATCH /call/:id/answer → send SDP answer
        await waitForIceGatheringComplete(pc);
        await API.completeCalleeSignaling(callId, answer.sdp!);

        // 6. Update state with peer connection
        dispatch({
          type: "UPDATE_P2P_CALL",
          payload: {
            callId,
            updates: {
              peerConnection: pc,
              callerId,
              callerName,
            },
          },
        });
      } catch (err) {
        console.error("Failed to join incoming call:", err);
        dispatch({
          type: "REMOVE_P2P_CALL",
          payload: { callId },
        });
      }
    },
    [currentClient, createPeerConnection, dispatch]
  );

  /**
   * End a call.
   */
  const endCall = useCallback(
    async (callId: string) => {
      try {
        await API.endCall(callId);
      } catch (err) {
        console.error("Failed to end call:", err);
      }

      // Clean up local resources
      const pc = peerConnectionsRef.current.get(callId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(callId);
      }

      dispatch({
        type: "CALL_ENDED",
        payload: { callId, reason: "local_hangup" },
      });
    },
    [dispatch]
  );

  /**
   * Toggle PTT for an outgoing call.
   */
  const togglePTT = useCallback(
    (callId: string, talking: boolean) => {
      const pc = peerConnectionsRef.current.get(callId);
      if (!pc) return;

      dispatch({
        type: "UPDATE_P2P_CALL",
        payload: { callId, updates: { isTalking: talking } },
      });

      const ensureLocalAudioSender = async () => {
        const senders = pc.getSenders();
        const hasAudioSender = senders.some(
          (sender) => sender.track && sender.track.kind === "audio"
        );
        if (hasAudioSender) return;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioTrack = stream.getAudioTracks()[0];
          audioTrack.enabled = false;
          pc.addTrack(audioTrack, stream);
        } catch (err) {
          console.error("Failed to get local audio for PTT:", err);
        }
      };

      const toggleTracks = () => {
        const senders = pc.getSenders();
        for (const sender of senders) {
          if (sender.track && sender.track.kind === "audio") {
            sender.track.enabled = talking;
          }
        }
      };

      if (talking) {
        ensureLocalAudioSender().finally(toggleTracks);
      } else {
        toggleTracks();
      }

      // Send talk_start/talk_stop via WebSocket
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        if (talking) {
          // Collect all active outgoing call IDs
          const activeCallIds = Object.keys(p2pCalls).filter(
            (id) => p2pCalls[id].state === "active"
          );

          websocket.send(
            JSON.stringify({
              type: "talk_start",
              callIds: activeCallIds,
            })
          );
        } else {
          websocket.send(
            JSON.stringify({
              type: "talk_stop",
            })
          );
        }
      }
    },
    [websocket, p2pCalls]
  );

  return {
    initiateCall,
    handleIncomingCall,
    endCall,
    togglePTT,
  };
}
