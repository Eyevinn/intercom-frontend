// Global auth-failure circuit breaker.
//
// Every REST call in the app flows through `handleFetchRequest`. When any of
// those calls comes back with a 401, `handleFetchRequest` reports it here. The
// breaker then coordinates the whole app's reaction so that a wave of 401s (one
// per polling loop) does not turn into a storm of independent reauth attempts:
//
//   closed    -> healthy; polling is allowed to run normally.
//   reauthing -> a 401 was seen; all polling pauses while a SINGLE reauth runs.
//   open       -> reauth failed; polling stays paused and the failure is
//                 surfaced. This state is NOT terminal: a half-open retry is
//                 scheduled on an exponential backoff, so a transient failure
//                 (e.g. a 500 while the OSC token refreshes, or a stray
//                 pre-config 401) recovers on its own and every polling loop —
//                 including the active-call heartbeat — resumes automatically.
//
// On a successful reauth the breaker returns to `closed` and every polling hook
// resumes with its failure counters reset.
//
// This module is intentionally framework-agnostic (no React, no imports of the
// API layer) so it can be driven from the plain `handleFetchRequest` module
// without creating an import cycle. The React side wires in the actual reauth
// network call, the error surfacing and the recovery callback via `configure`
// (see `use-reauth.tsx`).

import { backoffDelayMs } from "../utils/backoff.ts";

export type AuthBreakerState = "closed" | "reauthing" | "open";

type ReauthRunner = () => Promise<void>;
type ErrorReporter = (error: Error) => void;
type Recover = () => void;
type Listener = (state: AuthBreakerState) => void;

// Backoff bounds for the half-open retry loop. Starts a little slower than the
// per-request polling backoff because each retry runs the full (already
// internally-retried) reauth flow; capped so recovery after a transient outage
// is never more than ~30s away.
const RETRY_BASE_MS = 2000;
const RETRY_MAX_MS = 30000;

let state: AuthBreakerState = "closed";
let reauthRunner: ReauthRunner | null = null;
let errorReporter: ErrorReporter | null = null;
let onRecover: Recover | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
// Consecutive failed reauth attempts; drives the half-open backoff and lets the
// success path tell a fresh reauth from a recovery (so we only fire onRecover
// after an actual outage).
let openFailureCount = 0;
// A 401 can arrive before the React layer has wired in the reauth runner via
// configure(). We remember it here rather than tripping the breaker open with a
// swallowed error, and replay it once configure() runs.
let pendingReportBeforeConfigure = false;
const listeners = new Set<Listener>();

const notify = () => {
  // Copy to an array first so a listener that unsubscribes itself while being
  // notified does not mutate the set mid-iteration.
  [...listeners].forEach((listener) => listener(state));
};

const setState = (next: AuthBreakerState) => {
  if (state === next) return;
  state = next;
  notify();
};

const clearRetryTimer = () => {
  if (retryTimer !== null) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
};

// Schedule the next half-open attempt. Keeps the breaker from being terminal:
// while `open`, it periodically re-runs the reauth so polling can resume the
// moment auth is healthy again.
const scheduleRetry = () => {
  clearRetryTimer();
  retryTimer = setTimeout(
    () => {
      retryTimer = null;
      // Only retry if we are still open — a reset()/success may have raced.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (state === "open") startReauth();
    },
    backoffDelayMs(openFailureCount, {
      baseMs: RETRY_BASE_MS,
      maxMs: RETRY_MAX_MS,
    })
  );
};

const fail = (error: Error) => {
  openFailureCount += 1;
  setState("open");
  if (errorReporter) errorReporter(error);
  // Non-terminal: arm the next half-open retry.
  scheduleRetry();
};

const startReauth = (): Promise<void> => {
  const runner = reauthRunner;
  if (!runner) {
    fail(
      new Error("Authentication failed and no reauth handler is configured.")
    );
    return Promise.resolve();
  }

  setState("reauthing");

  return runner().then(
    () => {
      // Guard against a manual reset() (or a concurrent transition) that may
      // have raced with the reauth — only the in-flight reauth may close it.
      if (state !== "reauthing") return;
      const wasRecovering = openFailureCount > 0;
      openFailureCount = 0;
      clearRetryTimer();
      setState("closed");
      // Clear any surfaced "reconnecting" state once we recover from an outage.
      if (wasRecovering && onRecover) onRecover();
    },
    (error: unknown) => {
      // Same guard as the success branch (review suggestion): a reauth that
      // was in flight when reset() ran must not re-open the breaker.
      if (state !== "reauthing") return;
      fail(error instanceof Error ? error : new Error(String(error)));
    }
  );
};

export const authCircuitBreaker = {
  getState: (): AuthBreakerState => state,

  // Polling may run only while the breaker is closed.
  isActive: (): boolean => state === "closed",
  // A reauth is in flight — polling should pause and wait for resume.
  isPaused: (): boolean => state === "reauthing",
  // Reauth failed — polling should pause while the breaker retries (half-open).
  // Not terminal: callers should wait for resume rather than stop forever.
  isTripped: (): boolean => state === "open",

  // Subscribe to state transitions. Returns an unsubscribe function.
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Wire in the actual reauth network call, the error surfacing and an optional
  // recovery callback (used to clear any surfaced "reconnecting" state). Called
  // once from the React layer on mount.
  configure(options: {
    reauthRunner: ReauthRunner;
    onError: ErrorReporter;
    onRecover?: Recover;
  }): void {
    reauthRunner = options.reauthRunner;
    errorReporter = options.onError;
    onRecover = options.onRecover ?? null;

    // Replay a 401 that arrived before we were wired in (defensive guard).
    if (pendingReportBeforeConfigure && state === "closed") {
      pendingReportBeforeConfigure = false;
      startReauth();
    }
  },

  // Single interception point for 401s, invoked from `handleFetchRequest`.
  // Only the first 401 while healthy trips the breaker; any 401s that arrive
  // while a reauth is already in flight (or while open and retrying) are
  // ignored, guaranteeing exactly one coordinated reauth at a time.
  report401(): Promise<void> {
    if (state !== "closed") return Promise.resolve();

    if (!reauthRunner) {
      // Not wired in yet — don't trip terminally with a swallowed error. Keep
      // polling alive and let configure() replay this once it runs.
      pendingReportBeforeConfigure = true;
      return Promise.resolve();
    }

    return startReauth();
  },

  // Manually return the breaker to a healthy state (e.g. on teardown or an
  // explicit user-driven retry). Also cancels any pending half-open retry.
  reset(): void {
    clearRetryTimer();
    openFailureCount = 0;
    pendingReportBeforeConfigure = false;
    setState("closed");
  },

  // Test-only: wipe all module-level state between tests.
  resetForTests(): void {
    clearRetryTimer();
    state = "closed";
    reauthRunner = null;
    errorReporter = null;
    onRecover = null;
    openFailureCount = 0;
    pendingReportBeforeConfigure = false;
    listeners.clear();
  },
};
