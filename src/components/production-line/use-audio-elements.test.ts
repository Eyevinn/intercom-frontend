import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioElements } from "./use-audio-elements.ts";

describe("useAudioElements", () => {
  it("starts with an empty array", () => {
    const { result } = renderHook(() => useAudioElements());

    expect(result.current.audioElements).toEqual([]);
  });

  it("can add audio elements via setAudioElements", () => {
    const { result } = renderHook(() => useAudioElements());

    const mockEl = {
      pause: vi.fn(),
      srcObject: null,
    } as unknown as HTMLAudioElement;

    act(() => {
      result.current.setAudioElements([mockEl]);
    });

    expect(result.current.audioElements).toHaveLength(1);
    expect(result.current.audioElements[0]).toBe(mockEl);
  });

  it("cleanUpAudio pauses and nulls srcObject on all elements", () => {
    const { result } = renderHook(() => useAudioElements());

    const el1 = {
      pause: vi.fn(),
      srcObject: "stream1",
    } as unknown as HTMLAudioElement;
    const el2 = {
      pause: vi.fn(),
      srcObject: "stream2",
    } as unknown as HTMLAudioElement;

    act(() => {
      result.current.setAudioElements([el1, el2]);
    });

    act(() => {
      result.current.cleanUpAudio();
    });

    expect(el1.pause).toHaveBeenCalled();
    expect(el2.pause).toHaveBeenCalled();
    expect(el1.srcObject).toBeNull();
    expect(el2.srcObject).toBeNull();
  });

  it("cleans up audio elements on unmount", () => {
    const el = {
      pause: vi.fn(),
      srcObject: "stream",
    } as unknown as HTMLAudioElement;

    const { result, unmount } = renderHook(() => useAudioElements());

    act(() => {
      result.current.setAudioElements([el]);
    });

    unmount();

    expect(el.pause).toHaveBeenCalled();
    expect(el.srcObject).toBeNull();
  });
});
