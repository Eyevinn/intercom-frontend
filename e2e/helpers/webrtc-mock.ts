import { Page } from "@playwright/test";

export const setupWebRTCMocks = async (page: Page) => {
  await page.addInitScript(() => {
    // Override getUserMedia to always return a mock MediaStream immediately.
    // Returns an empty MediaStream (no tracks) — sufficient for the app's
    // permission check which only needs the promise to resolve successfully.
    // Uses Object.defineProperty on the prototype for cross-browser compatibility
    // (WebKit may not allow direct assignment on navigator.mediaDevices).
    const mockGetUserMedia = async () => new MediaStream();
    Object.defineProperty(MediaDevices.prototype, "getUserMedia", {
      value: mockGetUserMedia,
      writable: true,
      configurable: true,
    });

    // Override enumerateDevices to return predictable devices
    const mockEnumerateDevices = async () =>
      [
        {
          deviceId: "mock-input-1",
          kind: "audioinput",
          label: "Mock Microphone",
          groupId: "group-1",
          toJSON: () => ({}),
        },
        {
          deviceId: "mock-output-1",
          kind: "audiooutput",
          label: "Mock Speaker",
          groupId: "group-1",
          toJSON: () => ({}),
        },
      ] as MediaDeviceInfo[];
    Object.defineProperty(MediaDevices.prototype, "enumerateDevices", {
      value: mockEnumerateDevices,
      writable: true,
      configurable: true,
    });

    // Patch RTCPeerConnection to handle mock SDP gracefully
    const OriginalRTC = window.RTCPeerConnection;
    class MockRTCPeerConnection extends OriginalRTC {
      async setRemoteDescription(desc: RTCSessionDescriptionInit) {
        try {
          return await super.setRemoteDescription(desc);
        } catch {
          // Silently handle invalid SDP from mock API
        }
      }

      async createAnswer() {
        try {
          return await super.createAnswer();
        } catch {
          return {
            type: "answer" as RTCSdpType,
            sdp: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:0\r\na=recvonly\r\n",
          };
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.RTCPeerConnection = MockRTCPeerConnection as any;

    // Stub setSinkId on audio elements (not supported in all browsers)
    if (!HTMLMediaElement.prototype.setSinkId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HTMLMediaElement.prototype as any).setSinkId = async () => {};
    }
  });
};
