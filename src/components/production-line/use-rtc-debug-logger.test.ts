import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRtcDebugLogger } from "./use-rtc-debug-logger.ts";

// Mock the logger to prevent console output in tests
vi.mock("../../utils/logger.ts", () => ({
  default: {
    cyan: vi.fn(),
    red: vi.fn(),
    log: vi.fn(),
  },
}));

/**
 * Minimal mock RTCPeerConnection that extends EventTarget so
 * addEventListener/removeEventListener work natively.
 */
class MockRTCPeerConnection extends EventTarget {
  iceGatheringState: RTCIceGatheringState = "new";

  iceConnectionState: RTCIceConnectionState = "new";

  connectionState: RTCPeerConnectionState = "new";

  signalingState: RTCSignalingState = "stable";
}

describe("useRtcDebugLogger", () => {
  it("registers 7 event listeners on mount", () => {
    const pc = new MockRTCPeerConnection();
    const addSpy = vi.spyOn(pc, "addEventListener");

    renderHook(() => useRtcDebugLogger(pc as unknown as RTCPeerConnection));

    expect(addSpy).toHaveBeenCalledTimes(7);
    expect(addSpy).toHaveBeenCalledWith(
      "icegatheringstatechange",
      expect.any(Function)
    );
    expect(addSpy).toHaveBeenCalledWith(
      "iceconnectionstatechange",
      expect.any(Function)
    );
    expect(addSpy).toHaveBeenCalledWith(
      "connectionstatechange",
      expect.any(Function)
    );
    expect(addSpy).toHaveBeenCalledWith(
      "signalingstatechange",
      expect.any(Function)
    );
    expect(addSpy).toHaveBeenCalledWith("icecandidate", expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith(
      "icecandidateerror",
      expect.any(Function)
    );
    expect(addSpy).toHaveBeenCalledWith(
      "negotiationneeded",
      expect.any(Function)
    );
  });

  it("removes all event listeners on unmount", () => {
    const pc = new MockRTCPeerConnection();
    const removeSpy = vi.spyOn(pc, "removeEventListener");

    const { unmount } = renderHook(() =>
      useRtcDebugLogger(pc as unknown as RTCPeerConnection)
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledTimes(7);
    expect(removeSpy).toHaveBeenCalledWith(
      "icegatheringstatechange",
      expect.any(Function)
    );
    expect(removeSpy).toHaveBeenCalledWith(
      "connectionstatechange",
      expect.any(Function)
    );
  });

  it("handles null peer connection without errors", () => {
    const { unmount } = renderHook(() => useRtcDebugLogger(null));

    // Should not throw
    expect(() => unmount()).not.toThrow();
  });
});
