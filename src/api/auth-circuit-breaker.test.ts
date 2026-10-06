import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authCircuitBreaker } from "./auth-circuit-breaker.ts";

describe("authCircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    authCircuitBreaker.resetForTests();
  });

  afterEach(() => {
    authCircuitBreaker.resetForTests();
    vi.useRealTimers();
  });

  it("starts closed and active", () => {
    expect(authCircuitBreaker.getState()).toBe("closed");
    expect(authCircuitBreaker.isActive()).toBe(true);
    expect(authCircuitBreaker.isPaused()).toBe(false);
    expect(authCircuitBreaker.isTripped()).toBe(false);
  });

  it("pauses (reauthing) immediately on the first 401 and runs the reauth exactly once", async () => {
    const reauthRunner = vi.fn().mockResolvedValue(undefined);
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    const pending = authCircuitBreaker.report401();

    // Synchronously paused before reauth resolves.
    expect(authCircuitBreaker.isPaused()).toBe(true);
    expect(reauthRunner).toHaveBeenCalledTimes(1);

    await pending;
  });

  it("deduplicates concurrent 401s into a single coordinated reauth", async () => {
    let resolveReauth!: () => void;
    const reauthRunner = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveReauth = resolve;
        })
    );
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    // Three polling loops all hit 401 at once.
    authCircuitBreaker.report401();
    authCircuitBreaker.report401();
    const last = authCircuitBreaker.report401();

    expect(reauthRunner).toHaveBeenCalledTimes(1);

    resolveReauth();
    await last;
  });

  it("resumes (closed) and notifies subscribers on reauth success", async () => {
    const reauthRunner = vi.fn().mockResolvedValue(undefined);
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    const states: string[] = [];
    authCircuitBreaker.subscribe((s) => states.push(s));

    await authCircuitBreaker.report401();

    expect(authCircuitBreaker.isActive()).toBe(true);
    expect(authCircuitBreaker.getState()).toBe("closed");
    // Paused on 401, then resumed on success.
    expect(states).toEqual(["reauthing", "closed"]);
  });

  it("trips open and surfaces the error on reauth failure", async () => {
    const failure = Object.assign(new Error("still unauthorized"), {
      status: 401,
    });
    const reauthRunner = vi.fn().mockRejectedValue(failure);
    const onError = vi.fn();
    authCircuitBreaker.configure({ reauthRunner, onError });

    await authCircuitBreaker.report401();

    expect(authCircuitBreaker.isTripped()).toBe(true);
    expect(authCircuitBreaker.getState()).toBe("open");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(failure);
  });

  it("ignores further 401s once tripped open (no second reauth)", async () => {
    const reauthRunner = vi.fn().mockRejectedValue(new Error("nope"));
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    await authCircuitBreaker.report401();
    expect(authCircuitBreaker.isTripped()).toBe(true);

    await authCircuitBreaker.report401();
    expect(reauthRunner).toHaveBeenCalledTimes(1);
  });

  it("does NOT trip open when a 401 arrives before a runner is configured (defensive guard)", async () => {
    // A 401 can land before the React layer calls configure(). Rather than
    // tripping open with a swallowed error (which would freeze polling), the
    // breaker stays closed and remembers the report.
    await authCircuitBreaker.report401();
    expect(authCircuitBreaker.isActive()).toBe(true);
    expect(authCircuitBreaker.isTripped()).toBe(false);
  });

  it("replays a pre-configure 401 once the runner is wired in", async () => {
    // 401 before configure() → remembered, no reauth yet.
    await authCircuitBreaker.report401();
    expect(authCircuitBreaker.isActive()).toBe(true);

    const reauthRunner = vi.fn().mockResolvedValue(undefined);
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    // configure() replays the queued 401, so the coordinated reauth runs.
    expect(reauthRunner).toHaveBeenCalledTimes(1);
    await vi.runOnlyPendingTimersAsync();
    expect(authCircuitBreaker.isActive()).toBe(true);
  });

  describe("half-open recovery (the breaker is not terminal)", () => {
    it("auto-recovers via a half-open retry after it trips open", async () => {
      let attempts = 0;
      const reauthRunner = vi.fn().mockImplementation(() => {
        attempts += 1;
        // First attempt fails (trips open), the scheduled retry succeeds.
        return attempts === 1
          ? Promise.reject(new Error("transient 500"))
          : Promise.resolve();
      });
      authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

      await authCircuitBreaker.report401();
      expect(authCircuitBreaker.isTripped()).toBe(true);

      // The half-open retry fires after the backoff and recovers the breaker.
      await vi.advanceTimersByTimeAsync(40000);

      expect(reauthRunner).toHaveBeenCalledTimes(2);
      expect(authCircuitBreaker.isActive()).toBe(true);
    });

    it("keeps retrying while reauth keeps failing (never gives up terminally)", async () => {
      const reauthRunner = vi.fn().mockRejectedValue(new Error("still down"));
      authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

      await authCircuitBreaker.report401();
      expect(authCircuitBreaker.isTripped()).toBe(true);
      expect(reauthRunner).toHaveBeenCalledTimes(1);

      // Successive backoff windows each fire another half-open attempt.
      await vi.advanceTimersByTimeAsync(40000);
      const afterFirstWindow = reauthRunner.mock.calls.length;
      expect(afterFirstWindow).toBeGreaterThan(1);

      await vi.advanceTimersByTimeAsync(40000);
      expect(reauthRunner.mock.calls.length).toBeGreaterThan(afterFirstWindow);
      expect(authCircuitBreaker.isTripped()).toBe(true);
    });

    it("fires onRecover (and notifies closed) when a retry recovers from open", async () => {
      let attempts = 0;
      const reauthRunner = vi.fn().mockImplementation(() => {
        attempts += 1;
        return attempts === 1
          ? Promise.reject(new Error("transient"))
          : Promise.resolve();
      });
      const onRecover = vi.fn();
      authCircuitBreaker.configure({
        reauthRunner,
        onError: vi.fn(),
        onRecover,
      });

      const states: string[] = [];
      authCircuitBreaker.subscribe((s) => states.push(s));

      await authCircuitBreaker.report401();
      await vi.advanceTimersByTimeAsync(40000);

      expect(onRecover).toHaveBeenCalledTimes(1);
      expect(states).toEqual(["reauthing", "open", "reauthing", "closed"]);
    });

    it("does NOT fire onRecover on a first-attempt success (no outage to recover from)", async () => {
      const reauthRunner = vi.fn().mockResolvedValue(undefined);
      const onRecover = vi.fn();
      authCircuitBreaker.configure({
        reauthRunner,
        onError: vi.fn(),
        onRecover,
      });

      await authCircuitBreaker.report401();

      expect(authCircuitBreaker.isActive()).toBe(true);
      expect(onRecover).not.toHaveBeenCalled();
    });

    it("cancels the pending half-open retry on reset", async () => {
      const reauthRunner = vi.fn().mockRejectedValue(new Error("down"));
      authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

      await authCircuitBreaker.report401();
      expect(authCircuitBreaker.isTripped()).toBe(true);
      expect(reauthRunner).toHaveBeenCalledTimes(1);

      authCircuitBreaker.reset();
      expect(authCircuitBreaker.isActive()).toBe(true);

      // No scheduled retry should fire after a reset.
      await vi.advanceTimersByTimeAsync(60000);
      expect(reauthRunner).toHaveBeenCalledTimes(1);
    });

    it("a reauth that was in flight when reset() ran cannot re-open the breaker", async () => {
      let rejectReauth!: (err: Error) => void;
      const reauthRunner = vi.fn().mockImplementation(
        () =>
          new Promise<void>((_, reject) => {
            rejectReauth = reject;
          })
      );
      authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

      const pending = authCircuitBreaker.report401();
      expect(authCircuitBreaker.isPaused()).toBe(true);

      // Teardown resets the breaker while the reauth is still in flight.
      authCircuitBreaker.reset();
      expect(authCircuitBreaker.isActive()).toBe(true);

      // The late rejection must not trip the breaker back open.
      rejectReauth(new Error("too late"));
      await pending;
      expect(authCircuitBreaker.isActive()).toBe(true);
    });
  });

  it("reset returns the breaker to closed", async () => {
    const reauthRunner = vi.fn().mockRejectedValue(new Error("nope"));
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    await authCircuitBreaker.report401();
    expect(authCircuitBreaker.isTripped()).toBe(true);

    authCircuitBreaker.reset();
    expect(authCircuitBreaker.isActive()).toBe(true);
  });

  it("stops notifying after unsubscribe", async () => {
    const reauthRunner = vi.fn().mockResolvedValue(undefined);
    authCircuitBreaker.configure({ reauthRunner, onError: vi.fn() });

    const listener = vi.fn();
    const unsubscribe = authCircuitBreaker.subscribe(listener);
    unsubscribe();

    await authCircuitBreaker.report401();

    expect(listener).not.toHaveBeenCalled();
  });
});
