import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useVideoInput } from "./use-video-input.ts";

const makeTrack = () => ({ stop: vi.fn(), kind: "video" });

describe("useVideoInput", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    dispatch.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reset stops all camera tracks and clears the stream", async () => {
    const tracks = [makeTrack(), makeTrack()];
    const stream = {
      getTracks: () => tracks,
    } as unknown as MediaStream;

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(stream),
      },
    });

    const { result } = renderHook(() =>
      useVideoInput({ videoInputId: "cam-1", dispatch })
    );

    await waitFor(() => {
      expect(result.current[0]).toBe(stream);
    });

    act(() => {
      // reset is the third tuple element
      result.current[2]();
    });

    tracks.forEach((t) => {
      expect(t.stop).toHaveBeenCalledTimes(1);
    });
    expect(result.current[0]).toBeNull();
  });

  it("reset is a no-op when there is no live stream", () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
    });

    const { result } = renderHook(() =>
      useVideoInput({ videoInputId: "no-device", dispatch })
    );

    expect(() => {
      act(() => {
        result.current[2]();
      });
    }).not.toThrow();
    expect(result.current[0]).toBeNull();
  });
});
