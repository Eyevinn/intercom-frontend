// Exponential backoff with jitter, shared by the polling hooks so a
// persistently failing endpoint is not hammered with immediate retries and
// many clients backing off together do not form a thundering herd.

export const BASE_BACKOFF_MS = 1000;
export const MAX_BACKOFF_MS = 30000;
// ±20% random jitter applied to each delay.
export const JITTER_RATIO = 0.2;

type BackoffOptions = {
  baseMs?: number;
  maxMs?: number;
  jitterRatio?: number;
  // Injectable for deterministic tests; defaults to Math.random.
  random?: () => number;
};

// Delay before the next attempt given the number of consecutive failures so
// far (1 = first failure). The exponential term doubles each failure and is
// capped at maxMs; jitter then spreads the result by ±jitterRatio. Callers are
// expected to reset failureCount to 0 on success so the next error starts from
// baseMs again.
export const backoffDelayMs = (
  failureCount: number,
  {
    baseMs = BASE_BACKOFF_MS,
    maxMs = MAX_BACKOFF_MS,
    jitterRatio = JITTER_RATIO,
    random = Math.random,
  }: BackoffOptions = {}
): number => {
  const exponential = Math.min(baseMs * 2 ** (failureCount - 1), maxMs);
  // random() * 2 - 1 maps [0,1) onto [-1,1), so jitter is within ±jitterRatio.
  const jitter = exponential * jitterRatio * (random() * 2 - 1);
  return Math.max(0, Math.round(exponential + jitter));
};
