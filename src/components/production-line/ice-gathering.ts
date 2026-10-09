/**
 * Wait for ICE gathering to complete, or resolve with whatever candidates
 * have been gathered so far once the timeout elapses.
 */

const DEFAULT_ICE_TIMEOUT_MS = 8000;

export const waitForIceGathering = (
  rtcPeerConnection: RTCPeerConnection,
  timeoutMs: number = DEFAULT_ICE_TIMEOUT_MS
): Promise<void> =>
  new Promise((resolve) => {
    if (rtcPeerConnection.iceGatheringState === "complete") {
      resolve();
      return;
    }

    let timeout: number | null = null;

    const cb = () => {
      if (rtcPeerConnection.iceGatheringState === "complete") {
        rtcPeerConnection.removeEventListener("icegatheringstatechange", cb);
        if (timeout !== null) window.clearTimeout(timeout);
        resolve();
      }
    };

    timeout = window.setTimeout(() => {
      rtcPeerConnection.removeEventListener("icegatheringstatechange", cb);
      resolve();
    }, timeoutMs);

    rtcPeerConnection.addEventListener("icegatheringstatechange", cb);
  });
