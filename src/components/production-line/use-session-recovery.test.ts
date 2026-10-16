import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  RECOVERY_WINDOW_MS,
  useSessionRecovery,
} from "./use-session-recovery.ts";

type TState = RTCPeerConnectionState | null;

const setup = (initial: TState = "connected") => {
  const onRejoin = vi.fn();
  const hook = renderHook(
    ({ connectionState }: { connectionState: TState }) =>
      useSessionRecovery({ connectionState, onRejoin }),
    { initialProps: { connectionState: initial } }
  );
  return { ...hook, onRejoin };
};

describe("useSessionRecovery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is ok while the call is healthy", () => {
    const { result } = setup();
    expect(result.current.phase).toBe("ok");
    expect(result.current.attempt).toBe(0);
  });

  it("shows reconnecting while the manager is unreachable and recovers without rejoining", () => {
    const { result, onRejoin } = setup();
    act(() => result.current.reportHeartbeat("unreachable"));
    expect(result.current.phase).toBe("reconnecting");

    act(() => result.current.reportHeartbeat("ok"));
    expect(result.current.phase).toBe("ok");
    expect(result.current.attempt).toBe(0);
    expect(onRejoin).not.toHaveBeenCalled();
  });

  it("automatically rejoins when the session is lost", async () => {
    const { result, rerender, onRejoin } = setup();
    act(() => result.current.reportHeartbeat("lost"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(onRejoin).toHaveBeenCalledTimes(1);
    expect(result.current.attempt).toBe(1);
    expect(result.current.phase).toBe("reconnecting");

    // New connection state is reset, then connects.
    rerender({ connectionState: null });
    rerender({ connectionState: "connected" });
    expect(result.current.phase).toBe("ok");
  });

  it("automatically rejoins when a connected peer connection fails", async () => {
    const { result, rerender, onRejoin } = setup();
    rerender({ connectionState: "failed" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);
    expect(result.current.attempt).toBe(1);
  });

  it("does not rejoin when the peer connection fails before ever connecting", async () => {
    const { result, onRejoin } = setup("failed");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).not.toHaveBeenCalled();
    expect(result.current.phase).toBe("ok");
  });

  it("retries with backoff when re-establishing the session fails", async () => {
    const { result, onRejoin } = setup();
    act(() => result.current.reportHeartbeat("lost"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    act(() => result.current.reportEstablishError());
    // Not retried immediately.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(onRejoin).toHaveBeenCalledTimes(2);
    expect(result.current.attempt).toBe(2);
  });

  it("backs off on repeated session loss instead of rejoining at 0ms every cycle", async () => {
    const { result, onRejoin } = setup();
    // First loss rejoins immediately.
    act(() => result.current.reportHeartbeat("lost"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    // The rejoined session is lost again before it ever reconnects.
    act(() => result.current.reportHeartbeat("lost"));
    // This time a backoff applies, so there is no immediate rejoin.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    // The rejoin fires once the backoff window elapses.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(onRejoin).toHaveBeenCalledTimes(2);
  });

  it("backs off on repeated peer-connection failure after connecting", async () => {
    const { rerender, onRejoin } = setup();
    // A connected peer connection fails → immediate rejoin.
    rerender({ connectionState: "failed" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    // The fresh connection resets, then fails again before it connects.
    rerender({ connectionState: null });
    rerender({ connectionState: "failed" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(onRejoin).toHaveBeenCalledTimes(2);
  });

  it("resets the backoff after a confirmed reconnect", async () => {
    const { result, rerender, onRejoin } = setup();
    act(() => result.current.reportHeartbeat("lost"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(1);

    // The rejoin succeeds: reset state, then connect.
    rerender({ connectionState: null });
    rerender({ connectionState: "connected" });
    expect(result.current.phase).toBe("ok");

    // A later loss rejoins immediately again because the count was reset.
    act(() => result.current.reportHeartbeat("lost"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onRejoin).toHaveBeenCalledTimes(2);
  });

  it("gives up after the recovery window and allows a manual rejoin", async () => {
    const { result, onRejoin } = setup();
    act(() => result.current.reportHeartbeat("unreachable"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RECOVERY_WINDOW_MS);
    });
    expect(result.current.phase).toBe("failed");
    expect(onRejoin).not.toHaveBeenCalled();

    act(() => result.current.rejoin());
    expect(onRejoin).toHaveBeenCalledTimes(1);
    expect(result.current.attempt).toBe(1);
    expect(result.current.phase).toBe("reconnecting");
  });

  it("clears the failed state if the manager comes back on its own", async () => {
    const { result } = setup();
    act(() => result.current.reportHeartbeat("unreachable"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RECOVERY_WINDOW_MS);
    });
    expect(result.current.phase).toBe("failed");

    act(() => result.current.reportHeartbeat("ok"));
    expect(result.current.phase).toBe("ok");
  });
});
