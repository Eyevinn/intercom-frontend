import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePushToTalk } from "./use-push-to-talk.ts";

describe("usePushToTalk", () => {
  let muteInput: (mute: boolean) => void;

  beforeEach(() => {
    muteInput = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with isTalking as false", () => {
    const { result } = renderHook(() => usePushToTalk({ muteInput }));

    expect(result.current.isTalking).toBe(false);
  });

  it("should expose startTalking, stopTalking, handleLongPressStart, handleLongPressEnd", () => {
    const { result } = renderHook(() => usePushToTalk({ muteInput }));

    expect(typeof result.current.startTalking).toBe("function");
    expect(typeof result.current.stopTalking).toBe("function");
    expect(typeof result.current.handleLongPressStart).toBe("function");
    expect(typeof result.current.handleLongPressEnd).toBe("function");
  });

  // ── Direct start/stop ──────────────────────────────────────────────

  describe("startTalking / stopTalking", () => {
    it("should unmute and set isTalking=true on startTalking", () => {
      const { result } = renderHook(() => usePushToTalk({ muteInput }));

      act(() => {
        result.current.startTalking();
      });

      expect(muteInput).toHaveBeenCalledWith(false);
      expect(result.current.isTalking).toBe(true);
    });

    it("should mute and set isTalking=false on stopTalking", () => {
      const { result } = renderHook(() => usePushToTalk({ muteInput }));

      act(() => {
        result.current.startTalking();
      });
      act(() => {
        result.current.stopTalking();
      });

      expect(muteInput).toHaveBeenLastCalledWith(true);
      expect(result.current.isTalking).toBe(false);
    });
  });

  // ── Long press ─────────────────────────────────────────────────────

  describe("handleLongPressStart / handleLongPressEnd", () => {
    it("should not start talking before 300ms delay", () => {
      const { result } = renderHook(() => usePushToTalk({ muteInput }));

      act(() => {
        result.current.handleLongPressStart();
      });

      // Before 300ms: muteInput should not have been called with false
      expect(muteInput).not.toHaveBeenCalledWith(false);
      expect(result.current.isTalking).toBe(false);
    });

    it("should start talking after 300ms", () => {
      const { result } = renderHook(() => usePushToTalk({ muteInput }));

      act(() => {
        result.current.handleLongPressStart();
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(muteInput).toHaveBeenCalledWith(false);
      expect(result.current.isTalking).toBe(true);
    });

    it("should stop talking and clear timeout on handleLongPressEnd", () => {
      const { result } = renderHook(() => usePushToTalk({ muteInput }));

      act(() => {
        result.current.handleLongPressStart();
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.handleLongPressEnd();
      });

      expect(muteInput).toHaveBeenLastCalledWith(true);
      expect(result.current.isTalking).toBe(false);
    });

    it("should cancel pending start if released before 300ms", () => {
      const { result } = renderHook(() => usePushToTalk({ muteInput }));

      act(() => {
        result.current.handleLongPressStart();
      });

      // Release before 300ms
      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        result.current.handleLongPressEnd();
      });

      // The startTalking should never have fired
      expect(muteInput).not.toHaveBeenCalledWith(false);

      // Advance past 300ms - should not trigger now
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.isTalking).toBe(false);
    });
  });

  // ── Cleanup ────────────────────────────────────────────────────────

  describe("cleanup", () => {
    it("should clear timeout on unmount", () => {
      const { result, unmount } = renderHook(() =>
        usePushToTalk({ muteInput })
      );

      act(() => {
        result.current.handleLongPressStart();
      });

      unmount();

      // Advance timers after unmount - should not throw or cause issues
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // muteInput(false) should never have been called since we unmounted before 300ms
      expect(muteInput).not.toHaveBeenCalledWith(false);
    });
  });
});
