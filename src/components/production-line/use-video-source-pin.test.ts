import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TJoinProductionOptions } from "./types.ts";

const setLineWhepSource = vi.fn();
const setSessionVideoSource = vi.fn();

vi.mock("../../api/api.ts", () => ({
  API: {
    setLineWhepSource: (...args: unknown[]) => setLineWhepSource(...args),
    setSessionVideoSource: (...args: unknown[]) =>
      setSessionVideoSource(...args),
  },
}));

vi.mock("../../utils/logger.ts", () => ({
  default: { red: vi.fn(), yellow: vi.fn() },
}));

// eslint-disable-next-line import/first
import { useVideoSourcePin } from "./use-video-source-pin.ts";

const joinProductionOptions = {
  productionId: "1",
  lineId: "2",
  username: "user",
} as TJoinProductionOptions;

const tooEarly = () => Object.assign(new Error("Too Early"), { status: 425 });

describe("useVideoSourcePin", () => {
  beforeEach(() => {
    setLineWhepSource.mockReset().mockResolvedValue({});
    setSessionVideoSource.mockReset().mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("pushWhepSourceToBackend", () => {
    it("sets the line WHEP source", () => {
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      result.current.pushWhepSourceToBackend("session-a");

      expect(setLineWhepSource).toHaveBeenCalledWith({
        productionId: "1",
        lineId: "2",
        sessionId: "session-a",
      });
    });

    it("passes null to clear the WHEP source", () => {
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      result.current.pushWhepSourceToBackend(null);

      expect(setLineWhepSource).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: null })
      );
    });

    it("ignores empty session ids and missing production options", () => {
      const { result, rerender } = renderHook(
        ({ options }) =>
          useVideoSourcePin({
            joinProductionOptions: options,
            callSessionId: "self",
          }),
        {
          initialProps: {
            options: joinProductionOptions as TJoinProductionOptions | null,
          },
        }
      );

      result.current.pushWhepSourceToBackend("");
      rerender({ options: null });
      result.current.pushWhepSourceToBackend("session-a");

      expect(setLineWhepSource).not.toHaveBeenCalled();
    });

    it("does not throw when the request fails", async () => {
      setLineWhepSource.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      expect(() =>
        result.current.pushWhepSourceToBackend("session-a")
      ).not.toThrow();
      await Promise.resolve();
    });
  });

  describe("pushVideoSourceToBackend", () => {
    it("sets the session video source", async () => {
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      await result.current.pushVideoSourceToBackend("session-a");

      expect(setSessionVideoSource).toHaveBeenCalledWith({
        sessionId: "self",
        pinnedSessionId: "session-a",
      });
    });

    it("does nothing without a call session or with an empty id", async () => {
      const { result, rerender } = renderHook(
        ({ callSessionId }) =>
          useVideoSourcePin({ joinProductionOptions, callSessionId }),
        { initialProps: { callSessionId: "self" as string | null } }
      );

      await result.current.pushVideoSourceToBackend("");
      rerender({ callSessionId: null });
      await result.current.pushVideoSourceToBackend("session-a");

      expect(setSessionVideoSource).not.toHaveBeenCalled();
    });

    it("retries on 425 Too Early until it succeeds", async () => {
      vi.useFakeTimers();
      setSessionVideoSource
        .mockRejectedValueOnce(tooEarly())
        .mockRejectedValueOnce(tooEarly())
        .mockResolvedValueOnce({});
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      let done = false;
      act(() => {
        result.current.pushVideoSourceToBackend("session-a").then(() => {
          done = true;
        });
      });
      await act(() => vi.runAllTimersAsync());

      expect(done).toBe(true);
      expect(setSessionVideoSource).toHaveBeenCalledTimes(3);
    });

    it("gives up after the last retry delay", async () => {
      vi.useFakeTimers();
      setSessionVideoSource.mockRejectedValue(tooEarly());
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      const pending = result.current.pushVideoSourceToBackend("session-a");
      await act(() => vi.runAllTimersAsync());
      await pending;

      expect(setSessionVideoSource).toHaveBeenCalledTimes(6);
    });

    it("does not retry on other errors", async () => {
      setSessionVideoSource.mockRejectedValue(
        Object.assign(new Error("Not Found"), { status: 404 })
      );
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      await result.current.pushVideoSourceToBackend("session-a");

      expect(setSessionVideoSource).toHaveBeenCalledTimes(1);
    });

    it("stops retrying an older pin once a newer one is requested", async () => {
      vi.useFakeTimers();
      setSessionVideoSource
        .mockRejectedValueOnce(tooEarly())
        .mockResolvedValue({});
      const { result } = renderHook(() =>
        useVideoSourcePin({ joinProductionOptions, callSessionId: "self" })
      );

      const first = result.current.pushVideoSourceToBackend("session-a");
      await act(async () => {
        await Promise.resolve();
      });
      const second = result.current.pushVideoSourceToBackend("session-b");
      await act(() => vi.runAllTimersAsync());
      await Promise.all([first, second]);

      const pinned = setSessionVideoSource.mock.calls.map(
        ([args]) => args.pinnedSessionId
      );
      expect(pinned).toEqual(["session-a", "session-b"]);
    });
  });
});
