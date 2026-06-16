import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitForIceGathering } from "./ice-gathering.ts";

/**
 * Minimal mock RTCPeerConnection that extends EventTarget so
 * addEventListener/removeEventListener work natively.
 */
class MockRTCPeerConnection extends EventTarget {
  iceGatheringState: RTCIceGatheringState = "new";

  simulateGatheringComplete() {
    this.iceGatheringState = "complete";
    this.dispatchEvent(new Event("icegatheringstatechange"));
  }
}

describe("waitForIceGathering", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves immediately if gathering is already complete", async () => {
    const pc = new MockRTCPeerConnection();
    pc.iceGatheringState = "complete";

    await expect(
      waitForIceGathering(pc as unknown as RTCPeerConnection)
    ).resolves.toBeUndefined();
  });

  it("resolves when gathering state changes to complete", async () => {
    const pc = new MockRTCPeerConnection();
    pc.iceGatheringState = "gathering";

    const promise = waitForIceGathering(pc as unknown as RTCPeerConnection);

    pc.simulateGatheringComplete();

    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves on timeout (proceeds with partial candidates)", async () => {
    const pc = new MockRTCPeerConnection();
    pc.iceGatheringState = "gathering";

    const promise = waitForIceGathering(
      pc as unknown as RTCPeerConnection,
      3000
    );

    vi.advanceTimersByTime(3000);

    await expect(promise).resolves.toBeUndefined();
  });

  it("cleans up event listener after completion", async () => {
    const pc = new MockRTCPeerConnection();
    pc.iceGatheringState = "gathering";

    const removeSpy = vi.spyOn(pc, "removeEventListener");

    const promise = waitForIceGathering(pc as unknown as RTCPeerConnection);

    pc.simulateGatheringComplete();
    await promise;

    expect(removeSpy).toHaveBeenCalledWith(
      "icegatheringstatechange",
      expect.any(Function)
    );
  });

  it("uses default 8-second timeout", async () => {
    const pc = new MockRTCPeerConnection();
    pc.iceGatheringState = "gathering";

    let settled = false;
    const promise = waitForIceGathering(
      pc as unknown as RTCPeerConnection
    ).then(() => {
      settled = true;
    });

    vi.advanceTimersByTime(7900);
    // micro-task to let any prematurely-resolved promise settle
    await Promise.resolve();
    expect(settled).toBe(false);

    vi.advanceTimersByTime(100);
    await promise;
    expect(settled).toBe(true);
  });
});
