import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSetupTokenRefresh } from "./use-reauth";
import { API } from "../api/api";

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../api/api", () => ({
  API: {
    reauth: vi.fn(),
  },
}));

const mockDispatch = vi.fn();
vi.mock("../global-state/context-provider", () => ({
  useGlobalState: vi.fn(() => [{}, mockDispatch]),
}));

const mockAPI = API as unknown as {
  reauth: ReturnType<typeof vi.fn>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeStatusError = (status: number, message = "error") => {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
};

// `setupTokenRefresh` bails out immediately when `import.meta.env.DEV` is
// true, which is Vitest's default. Stub it to false so the reauth logic
// under test actually runs (mirrors production/preview builds).
describe("useSetupTokenRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("DEV", false);
    mockDispatch.mockClear();
    mockAPI.reauth.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("on 405, calls API.reauth exactly once, dispatches no ERROR, and clears the hourly interval permanently", async () => {
    mockAPI.reauth.mockRejectedValue(
      makeStatusError(405, "Method Not Allowed")
    );

    const { result } = renderHook(() => useSetupTokenRefresh());

    await act(async () => {
      result.current.setupTokenRefresh();
      // Flush the immediately-invoked reauth() call (no sleeps expected)
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockAPI.reauth).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();

    // Advance well past the hourly interval — if it were still armed,
    // API.reauth would be called again
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2 * 60 * 60 * 1000);
    });

    expect(mockAPI.reauth).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("on a non-405 failure (403), still retries 3 times and dispatches the ERROR", async () => {
    mockAPI.reauth.mockRejectedValue(makeStatusError(403, "Forbidden"));

    const { result } = renderHook(() => useSetupTokenRefresh());

    await act(async () => {
      result.current.setupTokenRefresh();
      await vi.advanceTimersByTimeAsync(2 * 3000);
    });

    expect(mockAPI.reauth).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ERROR",
      payload: {
        error: expect.objectContaining({
          message: expect.stringContaining(
            "Failed to reauth after 3 attempts - 403"
          ),
        }),
      },
    });
  });

  it("on 500, still retries 3 times but suppresses the ERROR dispatch (existing behaviour)", async () => {
    mockAPI.reauth.mockRejectedValue(
      makeStatusError(500, "Internal Server Error")
    );

    const { result } = renderHook(() => useSetupTokenRefresh());

    await act(async () => {
      result.current.setupTokenRefresh();
      await vi.advanceTimersByTimeAsync(2 * 3000);
    });

    expect(mockAPI.reauth).toHaveBeenCalledTimes(3);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("on success, dispatches no error and schedules the hourly interval", async () => {
    mockAPI.reauth.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSetupTokenRefresh());

    await act(async () => {
      result.current.setupTokenRefresh();
      // Flush only the initial immediately-invoked reauth() call, without
      // advancing the clock (avoids also firing the hourly interval tick)
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockAPI.reauth).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();

    // Interval should still be armed and fire again after an hour
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    });

    expect(mockAPI.reauth).toHaveBeenCalledTimes(2);
  });
});
