// Global auth-failure circuit breaker.
//
// Every REST call in the app flows through `handleFetchRequest`. When any of
// those calls comes back with a 401, `handleFetchRequest` reports it here. The
// breaker then coordinates the whole app's reaction so that a wave of 401s (one
// per polling loop) does not turn into a storm of independent reauth attempts:
//
//   closed    -> healthy; polling is allowed to run normally.
//   reauthing -> a 401 was seen; all polling pauses while a SINGLE reauth runs.
//   open       -> reauth failed; polling stops and the error is surfaced.
//
// On a successful reauth the breaker returns to `closed` and every polling hook
// resumes with its failure counters reset.
//
// This module is intentionally framework-agnostic (no React, no imports of the
// API layer) so it can be driven from the plain `handleFetchRequest` module
// without creating an import cycle. The React side wires in the actual reauth
// network call and error surfacing via `configure` (see `use-reauth.tsx`).

export type AuthBreakerState = "closed" | "reauthing" | "open";

type ReauthRunner = () => Promise<void>;
type ErrorReporter = (error: Error) => void;
type Listener = (state: AuthBreakerState) => void;

let state: AuthBreakerState = "closed";
let reauthRunner: ReauthRunner | null = null;
let errorReporter: ErrorReporter | null = null;
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

const fail = (error: Error) => {
  setState("open");
  if (errorReporter) errorReporter(error);
};

export const authCircuitBreaker = {
  getState: (): AuthBreakerState => state,

  // Polling may run only while the breaker is closed.
  isActive: (): boolean => state === "closed",
  // A reauth is in flight — polling should pause and wait for resume.
  isPaused: (): boolean => state === "reauthing",
  // Reauth failed — polling should stop entirely.
  isTripped: (): boolean => state === "open",

  // Subscribe to state transitions. Returns an unsubscribe function.
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Wire in the actual reauth network call and the error surfacing. Called once
  // from the React layer on mount.
  configure(options: {
    reauthRunner: ReauthRunner;
    onError: ErrorReporter;
  }): void {
    reauthRunner = options.reauthRunner;
    errorReporter = options.onError;
  },

  // Single interception point for 401s, invoked from `handleFetchRequest`.
  // Only the first 401 while healthy trips the breaker; any 401s that arrive
  // while a reauth is already in flight (or after it has failed) are ignored,
  // guaranteeing exactly one coordinated reauth.
  report401(): Promise<void> {
    if (state !== "closed") return Promise.resolve();

    setState("reauthing");

    const runner = reauthRunner;
    if (!runner) {
      fail(
        new Error("Authentication failed and no reauth handler is configured.")
      );
      return Promise.resolve();
    }

    return runner().then(
      () => {
        // Guard against a manual reset that may have raced with the reauth.
        if (state === "reauthing") setState("closed");
      },
      (error: unknown) => {
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    );
  },

  // Manually return the breaker to a healthy state (e.g. on teardown or an
  // explicit user-driven retry).
  reset(): void {
    setState("closed");
  },

  // Test-only: wipe all module-level state between tests.
  resetForTests(): void {
    state = "closed";
    reauthRunner = null;
    errorReporter = null;
    listeners.clear();
  },
};
