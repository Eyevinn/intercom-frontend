import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useLinePolling } from "./use-line-polling.ts";
import { GlobalStateContext } from "../../global-state/context-provider.tsx";
import { TGlobalState } from "../../global-state/types.ts";
import { TJoinProductionOptions, TLine, TParticipant } from "./types.ts";
import { API } from "../../api/api.ts";
import { authCircuitBreaker } from "../../api/auth-circuit-breaker.ts";

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
  devices: { input: null, output: null, videoInput: null },
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
  hasVideo: false,
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
    authCircuitBreaker.resetForTests();
  });

  afterEach(() => {
    authCircuitBreaker.resetForTests();
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

    it("keeps polling past 10 consecutive failures so a brief backend outage recovers on its own", async () => {
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockRejectedValue(new Error("boom"));

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();

      for (let i = 0; i < 15; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
          await vi.advanceTimersByTimeAsync(60000);
        });
      }

      const callsSoFar = mockFetchLineParticipants.mock.calls.length;
      expect(callsSoFar).toBeGreaterThan(10);

      // Still retrying — the loop never bails out.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });
      expect(mockFetchLineParticipants.mock.calls.length).toBeGreaterThan(
        callsSoFar
      );

      expect(mockDispatch).not.toHaveBeenCalledWith(
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

  describe("line metadata refresh", () => {
    it("picks up a whepSourceSessionId change for a client already in the call", async () => {
      mockFetchProductionLine.mockResolvedValueOnce({
        ...line,
        whepSourceSessionId: null,
      });
      mockFetchLineParticipants
        .mockResolvedValueOnce([participant("initial")])
        .mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();
      expect(result.current?.whepSourceSessionId ?? null).toBeNull();

      // Someone else sets the WHEP source server-side.
      mockFetchProductionLine.mockResolvedValue({
        ...line,
        whepSourceSessionId: "session-other",
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(result.current?.whepSourceSessionId).toBe("session-other");
    });

    it("does not let the metadata refresh clobber long-polled participants", async () => {
      mockFetchProductionLine.mockResolvedValue({
        ...line,
        participants: [participant("stale")],
      });
      mockFetchLineParticipants
        .mockResolvedValueOnce([participant("fresh")])
        .mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );

      await flush();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(result.current?.participants.map((p) => p.name)).toEqual([
        "fresh",
      ]);
    });
  });

  describe("auth circuit breaker gating", () => {
    it("pauses the initial seed while the breaker is reauthing and runs it on resume", async () => {
      let resolveReauth!: () => void;
      authCircuitBreaker.configure({
        reauthRunner: () =>
          new Promise<void>((resolve) => {
            resolveReauth = resolve;
          }),
        onError: vi.fn(),
      });
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockReturnValue(new Promise(() => {}));

      // A 401 elsewhere trips the breaker into reauthing before we mount.
      await act(async () => {
        authCircuitBreaker.report401();
      });
      expect(authCircuitBreaker.isPaused()).toBe(true);

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );
      await flush();

      // Gated — the seed must not fire while a coordinated reauth is in flight.
      expect(mockFetchProductionLine).not.toHaveBeenCalled();

      // Reauth succeeds → breaker closes → the gated seed runs.
      await act(async () => {
        resolveReauth();
        await Promise.resolve();
        await Promise.resolve();
      });
      await flush();

      expect(authCircuitBreaker.isActive()).toBe(true);
      expect(mockFetchProductionLine).toHaveBeenCalledTimes(1);
    });

    it("resumes the seed after the breaker trips open and auto-recovers (not terminal)", async () => {
      let attempts = 0;
      authCircuitBreaker.configure({
        reauthRunner: () => {
          attempts += 1;
          return attempts === 1
            ? Promise.reject(new Error("transient"))
            : Promise.resolve();
        },
        onError: vi.fn(),
      });
      mockFetchProductionLine.mockResolvedValue(line);
      mockFetchLineParticipants.mockReturnValue(new Promise(() => {}));

      await act(async () => {
        authCircuitBreaker.report401();
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(authCircuitBreaker.isTripped()).toBe(true);

      renderHook(
        () => useLinePolling({ callId: "call-1", joinProductionOptions }),
        { wrapper }
      );
      await flush();
      expect(mockFetchProductionLine).not.toHaveBeenCalled();

      // Half-open retry recovers the breaker → the gated seed resumes.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(40000);
      });
      await flush();

      // The gated seed resumed. The exact count is deliberately not pinned:
      // the line-metadata refresh interval also calls fetchProductionLine once
      // a second, and this test advances the clock 40s to reach the half-open
      // retry. What matters is 0 calls while gated -> at least one after.
      expect(authCircuitBreaker.isActive()).toBe(true);
      expect(mockFetchProductionLine).toHaveBeenCalled();
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
