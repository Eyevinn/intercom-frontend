import { describe, it, expect, vi, beforeEach } from "vitest";
import { authCircuitBreaker } from "./auth-circuit-breaker.ts";

describe("authCircuitBreaker", () => {
  beforeEach(() => {
    authCircuitBreaker.resetForTests();
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

  it("trips open when no reauth runner is configured", async () => {
    await authCircuitBreaker.report401();
    expect(authCircuitBreaker.isTripped()).toBe(true);
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
