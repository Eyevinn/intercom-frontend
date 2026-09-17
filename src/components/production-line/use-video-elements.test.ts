import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const stopFrameMonitor = vi.fn();

vi.mock("./video-element-factory.ts", () => ({
  stopFrameMonitor: (el: HTMLVideoElement) => stopFrameMonitor(el),
}));

// eslint-disable-next-line import/first
import { useVideoElements } from "./use-video-elements.ts";

describe("useVideoElements", () => {
  beforeEach(() => {
    stopFrameMonitor.mockClear();
  });

  it("starts with an empty array", () => {
    const { result } = renderHook(() => useVideoElements());

    expect(result.current.videoElements).toEqual([]);
  });

  it("cleanUpVideo stops frame monitors, pauses and nulls srcObject", () => {
    const { result } = renderHook(() => useVideoElements());

    const el1 = {
      pause: vi.fn(),
      srcObject: "stream1",
    } as unknown as HTMLVideoElement;
    const el2 = {
      pause: vi.fn(),
      srcObject: "stream2",
    } as unknown as HTMLVideoElement;

    act(() => {
      result.current.setVideoElements([el1, el2]);
    });

    act(() => {
      result.current.cleanUpVideo();
    });

    expect(stopFrameMonitor).toHaveBeenCalledWith(el1);
    expect(stopFrameMonitor).toHaveBeenCalledWith(el2);
    expect(el1.pause).toHaveBeenCalled();
    expect(el2.pause).toHaveBeenCalled();
    expect(el1.srcObject).toBeNull();
    expect(el2.srcObject).toBeNull();
  });

  it("stops frame monitors for every element on unmount", () => {
    const el = {
      pause: vi.fn(),
      srcObject: "stream",
    } as unknown as HTMLVideoElement;

    const { result, unmount } = renderHook(() => useVideoElements());

    act(() => {
      result.current.setVideoElements([el]);
    });

    unmount();

    expect(stopFrameMonitor).toHaveBeenCalledWith(el);
    expect(el.pause).toHaveBeenCalled();
    expect(el.srcObject).toBeNull();
  });
});
