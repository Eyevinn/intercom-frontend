import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useHeartbeat } from "./use-heartbeat.ts";
import { GlobalStateContext } from "../../global-state/context-provider.tsx";
import { TGlobalState } from "../../global-state/types.ts";
import { API } from "../../api/api.ts";

// ── Mock API ────────────────────────────────────────────────────────────────

vi.mock("../../api/api.ts", () => ({
  API: {
    heartbeat: vi.fn(),
  },
}));

vi.mock("../../utils/logger.ts", () => ({
  default: {
    red: vi.fn(),
    cyan: vi.fn(),
    log: vi.fn(),
  },
}));

const mockHeartbeat = API.heartbeat as ReturnType<typeof vi.fn>;

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

const error401 = () =>
  Object.assign(new Error("unauthorized"), { status: 401 });
const error500 = () => Object.assign(new Error("boom"), { status: 500 });

// ── Tests ─────────────────────────────────────────────────────────────────

describe("useHeartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing without a session id", async () => {
    renderHook(() => useHeartbeat({ sessionId: null }), { wrapper });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(mockHeartbeat).not.toHaveBeenCalled();
  });

  it("sends the first heartbeat after the normal interval", async () => {
    mockHeartbeat.mockResolvedValue("ok");
    renderHook(() => useHeartbeat({ sessionId: "s1" }), { wrapper });

    // Nothing fires immediately.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(mockHeartbeat).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);
  });

  it("reschedules at the normal interval after a success", async () => {
    mockHeartbeat.mockResolvedValue("ok");
    renderHook(() => useHeartbeat({ sessionId: "s1" }), { wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(2);
  });

  it("backs off after an error instead of retrying at the fixed interval", async () => {
    mockHeartbeat.mockRejectedValue(error500());
    renderHook(() => useHeartbeat({ sessionId: "s1" }), { wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);

    // The backoff timer has not elapsed yet, so no retry has fired.
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);

    // Firing the pending backoff timer triggers exactly one retry.
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(2);
  });

  it("stops and dispatches HEARTBEAT_ERROR after 3 consecutive 401s", async () => {
    mockHeartbeat.mockRejectedValue(error401());
    renderHook(() => useHeartbeat({ sessionId: "s1" }), { wrapper });

    // Fire the initial timer, then each backoff timer, well past 3 failures.
    for (let i = 0; i < 6; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });
    }

    expect(mockHeartbeat).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "HEARTBEAT_ERROR",
        payload: expect.objectContaining({
          sessionId: "s1",
          error: expect.objectContaining({
            message: "Stopped heartbeat after 3 retries.",
          }),
        }),
      })
    );

    // No further timers pending — the loop has stopped.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(3);
  });

  it("does not send or reschedule after unmount", async () => {
    mockHeartbeat.mockResolvedValue("ok");
    const { unmount } = renderHook(() => useHeartbeat({ sessionId: "s1" }), {
      wrapper,
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    const callsBeforeUnmount = mockHeartbeat.mock.calls.length;

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(mockHeartbeat).toHaveBeenCalledTimes(callsBeforeUnmount);
  });
});
