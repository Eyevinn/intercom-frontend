import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAudioElement } from "./audio-element-factory.ts";

// Mock bowser so we can control browser detection
vi.mock("../../bowser.ts", () => ({
  isBrowserSafari: false,
  isMobile: false,
  isIpad: false,
}));

describe("createAudioElement", () => {
  let mockStream: MediaStream;
  let onError: (error: Error) => void;
  let onSinkError: (error: Error) => void;
  let origSrcObjectDesc: PropertyDescriptor | undefined;

  beforeEach(() => {
    mockStream = {
      id: "mock-stream",
      getAudioTracks: () => [],
    } as unknown as MediaStream;
    onError = vi.fn();
    onSinkError = vi.fn();

    // happy-dom validates srcObject must be a real MediaStream.
    // Override the property to accept any value in tests.
    origSrcObjectDesc = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      "srcObject"
    );
    let stored: MediaStream | null = null;
    Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
      get() {
        return stored;
      },
      set(v: MediaStream | null) {
        stored = v;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original srcObject descriptor
    if (origSrcObjectDesc) {
      Object.defineProperty(
        HTMLMediaElement.prototype,
        "srcObject",
        origSrcObjectDesc
      );
    }
  });

  it("creates an audio element with autoplay enabled", () => {
    const el = createAudioElement({
      stream: mockStream,
      lineId: "line-1",
      audiooutput: undefined,
      onError,
      onSinkError,
    });

    expect(el).toBeInstanceOf(HTMLAudioElement);
    expect(el.autoplay).toBe(true);
    expect(el.controls).toBe(false);
  });

  it("sets srcObject to the provided stream", () => {
    const el = createAudioElement({
      stream: mockStream,
      lineId: "line-1",
      audiooutput: undefined,
      onError,
      onSinkError,
    });

    expect(el.srcObject).toBe(mockStream);
  });

  it("sets an id containing the lineId", () => {
    const el = createAudioElement({
      stream: mockStream,
      lineId: "my-line",
      audiooutput: undefined,
      onError,
      onSinkError,
    });

    expect(el.id).toContain("rtc-audio-my-line-");
  });

  it("calls setSinkId when audiooutput is provided", () => {
    const setSinkIdMock = vi.fn().mockResolvedValue(undefined);
    const origSetSinkId = HTMLAudioElement.prototype.setSinkId;
    HTMLAudioElement.prototype.setSinkId = setSinkIdMock;

    createAudioElement({
      stream: mockStream,
      lineId: "line-1",
      audiooutput: "speaker-device-1",
      onError,
      onSinkError,
    });

    expect(setSinkIdMock).toHaveBeenCalledWith("speaker-device-1");

    HTMLAudioElement.prototype.setSinkId = origSetSinkId;
  });

  it("does not call setSinkId when audiooutput is undefined", () => {
    const setSinkIdMock = vi.fn().mockResolvedValue(undefined);
    const origSetSinkId = HTMLAudioElement.prototype.setSinkId;
    HTMLAudioElement.prototype.setSinkId = setSinkIdMock;

    createAudioElement({
      stream: mockStream,
      lineId: "line-1",
      audiooutput: undefined,
      onError,
      onSinkError,
    });

    expect(setSinkIdMock).not.toHaveBeenCalled();

    HTMLAudioElement.prototype.setSinkId = origSetSinkId;
  });

  it("calls onSinkError callback when setSinkId rejects", async () => {
    const sinkError = new Error("Sink not found");
    const setSinkIdMock = vi.fn().mockRejectedValue(sinkError);
    const origSetSinkId = HTMLAudioElement.prototype.setSinkId;
    HTMLAudioElement.prototype.setSinkId = setSinkIdMock;

    createAudioElement({
      stream: mockStream,
      lineId: "line-1",
      audiooutput: "bad-device",
      onError,
      onSinkError,
    });

    // Wait for the promise rejection to be handled
    await vi.waitFor(() => {
      expect(onSinkError).toHaveBeenCalledWith(sinkError);
    });

    HTMLAudioElement.prototype.setSinkId = origSetSinkId;
  });
});
