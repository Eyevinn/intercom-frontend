/**
 * Promisified ICE gathering state change listener.
 * Extracted from use-rtc-connection.ts lines 208-230.
 */

const DEFAULT_ICE_TIMEOUT_MS = 5000;

export const waitForIceGathering = (
  rtcPeerConnection: RTCPeerConnection,
  timeoutMs: number = DEFAULT_ICE_TIMEOUT_MS
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (rtcPeerConnection.iceGatheringState === "complete") {
      resolve();
      return;
    }

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
      reject(
        new Error(`ice gathering timeout (waited ${timeoutMs / 1000} seconds)`)
      );
    }, timeoutMs);

    rtcPeerConnection.addEventListener("icegatheringstatechange", cb);
  });
