import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useLinePolling } from "./use-line-polling.ts";
import { GlobalStateContext } from "../../global-state/context-provider.tsx";
import { TGlobalState } from "../../global-state/types.ts";
import { TJoinProductionOptions, TLine, TParticipant } from "./types.ts";
import { API } from "../../api/api.ts";

// ── Mock API ────────────────────────────────────────────────────────────────

vi.mock("../../api/api.ts", () => ({
  API: {
    fetchProductionLine: vi.fn(),
    fetchLineParticipants: vi.fn(),
  },
}));

vi.mock("../../utils/logger.ts", () => ({
  default: {
    red: vi.fn(),
    cyan: vi.fn(),
    log: vi.fn(),
  },
}));

const mockFetchProductionLine = API.fetchProductionLine as ReturnType<
  typeof vi.fn
>;
const mockFetchLineParticipants = API.fetchLineParticipants as ReturnType<
  typeof vi.fn
>;

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockDispatch = vi.fn();

const mockState: TGlobalState = {
  calls: {},
  error: {},
  reloadProductionList: false,
  reloadPresetList: false,
  production: null,
  selectedProductionId: null,
  devices: { input: null, output: null },
  userSettings: null,
  apiError: false,
  websocket: null,
};

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    GlobalStateContext.Provider,
    { value: [mockState, mockDispatch] },
    children
  );

const joinProductionOptions: TJoinProductionOptions = {
  productionId: "1",
  lineId: "2",
  username: "tester",
  lineUsedForProgramOutput: false,
  isProgramUser: false,
};

const participant = (name: string): TParticipant => ({
  name,
  sessionId: `session-${name}`,
  endpointId: `endpoint-${name}`,
  isActive: true,
  isWhip: false,
});

const line: TLine = {
  name: "Line 2",
  id: "2",
  participants: [participant("initial")],
};

// Lets the microtask queue drain so chained .then/.catch callbacks run.
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe("useLinePolling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("success path", () => {
    it("seeds metadata then updates participants from the long poll", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      // First poll resolves with a new participant list, subsequent polls hang
      // so the loop does not spin forever inside the test.
      mockFetchLineParticipants
        .mockResolvedValueOnce([participant("alice"), participant("bob")])
        .mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();

      expect(mockFetchProductionLine).toHaveBeenCalledTimes(1);
      expect(mockFetchLineParticipants).toHaveBeenCalledWith(
        1,
        2,
        expect.any(AbortSignal)
      );
      expect(result.current).not.toBeNull();
      expect(result.current?.name).toBe("Line 2");
      expect(result.current?.participants.map((p) => p.name)).toEqual([
        "alice",
        "bob",
      ]);
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ERROR" })
      );
    });

    it("re-issues the long poll immediately after a successful response", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants
        .mockResolvedValueOnce([participant("alice")])
        .mockReturnValue(new Promise(() => {}));

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();

      // No timer needed between successful polls — it fires again right away.
      expect(mockFetchLineParticipants).toHaveBeenCalledTimes(2);
    });
  });

  describe("failure path", () => {
    it("dispatches ERROR after 5 consecutive failures", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockRejectedValue(new Error("boom"));

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();

      // Advance through backoff-delayed retries until 5 failures accumulate.
      // Failures 2..5 wait on a backoff timer, so run all pending timers.
      for (let i = 0; i < 6; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
          await vi.runOnlyPendingTimersAsync();
        });
      }

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ERROR",
          payload: expect.objectContaining({ callId: "call-1" }),
        })
      );
    });

    it("does not hot-loop: a failed poll waits for a backoff timer before retrying", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockRejectedValue(new Error("boom"));

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      // Seed + first poll (failure #1).
      await flush();
      expect(mockFetchLineParticipants).toHaveBeenCalledTimes(1);

      // Without advancing timers, the failed poll must NOT re-fire immediately.
      await flush();
      expect(mockFetchLineParticipants).toHaveBeenCalledTimes(1);

      // Advancing past the (jittered) first backoff triggers exactly one more
      // attempt. The first delay is ~1000ms ±20% jitter, so advance clear of
      // the upper bound; the next backoff (~2000ms+) has not elapsed yet, so
      // the count lands at exactly 2.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });
      expect(mockFetchLineParticipants).toHaveBeenCalledTimes(2);
    });

    it("stops polling after 10 consecutive failures", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockRejectedValue(new Error("boom"));

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();

      // Drain all backoff timers well past the 10-failure bail-out.
      for (let i = 0; i < 15; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
          await vi.advanceTimersByTimeAsync(60000);
        });
      }

      const callsAfterBailout = mockFetchLineParticipants.mock.calls.length;

      // No further timers should be pending — the loop has bailed out.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });

      expect(mockFetchLineParticipants).toHaveBeenCalledTimes(
        callsAfterBailout
      );
      expect(callsAfterBailout).toBe(10);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            error: expect.objectContaining({
              message: "Line polling stopped after 10 consecutive failures.",
            }),
          }),
        })
      );
    });
  });

  describe("cleanup", () => {
    it("does not update state or retry after unmount", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockRejectedValue(new Error("boom"));

      const { unmount } = renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();
      const callsBeforeUnmount = mockFetchLineParticipants.mock.calls.length;

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });

      expect(mockFetchLineParticipants).toHaveBeenCalledTimes(
        callsBeforeUnmount
      );
    });
  });
});
