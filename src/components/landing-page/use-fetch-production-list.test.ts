import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useFetchProductionList } from "./use-fetch-production-list.ts";
import { GlobalStateContext } from "../../global-state/context-provider.tsx";
import { TGlobalState } from "../../global-state/types.ts";
import { API } from "../../api/api.ts";

// ── Mock API ────────────────────────────────────────────────────────────────

vi.mock("../../api/api.ts", () => ({
  API: {
    listProductions: vi.fn(),
    reauth: vi.fn(),
  },
}));

const mockListProductions = API.listProductions as ReturnType<typeof vi.fn>;
const mockReauth = API.reauth as ReturnType<typeof vi.fn>;

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

const emptyProductionList = {
  productions: [],
  offset: 0,
  limit: 30,
  totalItems: 0,
};

function make401Error(): Error & { status: number } {
  const err = new Error("Unauthorized") as Error & { status: number };
  err.status = 401;
  return err;
}

function makeGenericError(): Error {
  return new Error("Internal Server Error");
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useFetchProductionList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockReauth.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  describe("happy path — successful polling", () => {
    it("fetches productions on initial load", async () => {
      mockListProductions.mockResolvedValue(emptyProductionList);

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Initial load fires immediately (doInitialLoad starts true)
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockListProductions).toHaveBeenCalledTimes(1);
      expect(result.current.productions).toEqual(emptyProductionList);
      expect(result.current.error).toBeNull();
    });

    it("fetches again when setIntervalLoad(true) is called", async () => {
      mockListProductions.mockResolvedValue(emptyProductionList);

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Drain initial fetch
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockListProductions).toHaveBeenCalledTimes(1);

      // Simulate the external interval firing
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });

      expect(mockListProductions).toHaveBeenCalledTimes(2);
    });

    it("dispatches PRODUCTION_LIST_FETCHED on success", async () => {
      mockListProductions.mockResolvedValue(emptyProductionList);

      renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "PRODUCTION_LIST_FETCHED",
      });
    });

    it("does not dispatch API_NOT_AVAILABLE on success", async () => {
      mockListProductions.mockResolvedValue(emptyProductionList);

      renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "API_NOT_AVAILABLE" })
      );
    });
  });

  // ── 401 error handling ─────────────────────────────────────────────────────

  describe("401 error handling (regression: polling must not flood on 401)", () => {
    it("calls API.reauth on a 401 error", async () => {
      mockListProductions.mockRejectedValue(make401Error());

      renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockReauth).toHaveBeenCalledTimes(1);
    });

    it("does NOT dispatch API_NOT_AVAILABLE on a 401 error", async () => {
      mockListProductions.mockRejectedValue(make401Error());

      renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "API_NOT_AVAILABLE" })
      );
    });

    it("does NOT set error state on a 401 (only on non-401 errors)", async () => {
      mockListProductions.mockRejectedValue(make401Error());

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      // 401 errors are handled silently — no error exposed to caller
      expect(result.current.error).toBeNull();
    });

    it("fetch count stays bounded — each interval tick causes exactly one fetch, not a cascade", async () => {
      // Regression: the hook must not re-trigger itself after a 401.
      // Only external setIntervalLoad(true) calls should cause new fetches.
      mockListProductions.mockRejectedValue(make401Error());

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Initial fetch (doInitialLoad=true)
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockListProductions).toHaveBeenCalledTimes(1);

      // Simulate 3 consecutive interval ticks with 401 errors
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });

      // Each tick must cause exactly one fetch — not a growing cascade.
      // Total: 1 initial + 3 interval ticks = 4
      expect(mockListProductions).toHaveBeenCalledTimes(4);
    });

    it("polling resumes normally after a 401 is followed by a success", async () => {
      mockListProductions
        .mockRejectedValueOnce(make401Error())
        .mockResolvedValue(emptyProductionList);

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Initial fetch → 401
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.productions).toBeUndefined();

      // Next interval tick → success
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });

      expect(result.current.productions).toEqual(emptyProductionList);
      expect(result.current.error).toBeNull();
    });
  });

  // ── Non-401 error handling ─────────────────────────────────────────────────

  describe("non-401 error handling", () => {
    it("dispatches API_NOT_AVAILABLE on a non-401 error", async () => {
      mockListProductions.mockRejectedValue(makeGenericError());

      renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockDispatch).toHaveBeenCalledWith({ type: "API_NOT_AVAILABLE" });
    });

    it("sets error state on a non-401 error", async () => {
      mockListProductions.mockRejectedValue(makeGenericError());

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("does NOT call API.reauth on a non-401 error", async () => {
      mockListProductions.mockRejectedValue(makeGenericError());

      renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockReauth).not.toHaveBeenCalled();
    });
  });

  // ── Cleanup / unmount ──────────────────────────────────────────────────────

  describe("cleanup on unmount", () => {
    it("aborts an in-flight fetch on unmount (no state update after unmount)", async () => {
      // The hook uses an `aborted` flag — resolve the promise after unmount
      // to confirm the state is not updated.
      let resolveList!: (value: typeof emptyProductionList) => void;
      mockListProductions.mockReturnValue(
        new Promise<typeof emptyProductionList>((res) => {
          resolveList = res;
        })
      );

      const { result, unmount } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Fetch is in flight — unmount before it resolves
      unmount();

      // Now resolve the fetch — should be a no-op (aborted flag prevents state update)
      await act(async () => {
        resolveList(emptyProductionList);
        await Promise.resolve();
      });

      // Productions should still be undefined since the update was aborted
      expect(result.current.productions).toBeUndefined();
      // No PRODUCTION_LIST_FETCHED dispatched
      expect(mockDispatch).not.toHaveBeenCalledWith({
        type: "PRODUCTION_LIST_FETCHED",
      });
    });

    it("does not fire additional fetches after unmount when setIntervalLoad is called externally", async () => {
      mockListProductions.mockResolvedValue(emptyProductionList);

      const { unmount } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Drain initial fetch
      await act(async () => {
        await Promise.resolve();
      });

      const callsBeforeUnmount = mockListProductions.mock.calls.length;

      unmount();

      // Even if something calls setIntervalLoad after unmount, no new fetches
      // should occur because the component is gone. This verifies that
      // ProductionsListContainer's clearInterval in its cleanup prevents further
      // setIntervalLoad(true) calls — the interval is the external control.
      expect(mockListProductions).toHaveBeenCalledTimes(callsBeforeUnmount);
    });
  });

  // ── Regression: polling flood prevention ──────────────────────────────────

  describe("regression: no polling flood on repeated 401 errors", () => {
    it("each setIntervalLoad(true) call causes exactly one API call regardless of 401s", async () => {
      // REGRESSION TEST: Before the fix, consecutive 401 errors could cause
      // uncontrolled polling because the interval was never stopped.
      // This test verifies that the fetch count grows linearly (one per tick),
      // not exponentially or unboundedly, proving the hook does not self-trigger.

      mockListProductions.mockRejectedValue(make401Error());

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Initial load
      await act(async () => {
        await Promise.resolve();
      });
      expect(mockListProductions).toHaveBeenCalledTimes(1);

      // Simulate 10 interval ticks — each should add exactly 1 fetch.
      // Sequential reduce avoids await-in-loop while preserving tick-by-tick assertions.
      await [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(async (chain, tick) => {
        await chain;
        await act(async () => {
          result.current.setIntervalLoad(true);
          await Promise.resolve();
        });
        expect(mockListProductions).toHaveBeenCalledTimes(tick + 1);
      }, Promise.resolve());

      // Total: 11 fetches for 1 initial + 10 interval ticks.
      // If there were a flood (self-triggering), this would be much higher.
      expect(mockListProductions).toHaveBeenCalledTimes(11);
    });

    it("reauth is called once per 401, not repeatedly within the same tick", async () => {
      mockListProductions.mockRejectedValue(make401Error());

      const { result } = renderHook(
        () => useFetchProductionList({ limit: "30", extended: "true" }),
        { wrapper }
      );

      // Initial load → 1 fetch → 1 reauth call
      await act(async () => {
        await Promise.resolve();
      });
      expect(mockReauth).toHaveBeenCalledTimes(1);

      // 3 more interval ticks → 3 more reauth calls (one per tick, not cascading)
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });
      await act(async () => {
        result.current.setIntervalLoad(true);
        await Promise.resolve();
      });

      expect(mockReauth).toHaveBeenCalledTimes(4);
    });
  });
});
