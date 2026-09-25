import { describe, it, expect } from "vitest";
import {
  backoffDelayMs,
  BASE_BACKOFF_MS,
  MAX_BACKOFF_MS,
  JITTER_RATIO,
} from "./backoff.ts";

describe("backoffDelayMs", () => {
  // random() === 0.5 maps to jitter 0, so the result is the pure exponential.
  const noJitter = () => 0.5;

  it("doubles the delay for each consecutive failure", () => {
    expect(backoffDelayMs(1, { random: noJitter })).toBe(1000);
    expect(backoffDelayMs(2, { random: noJitter })).toBe(2000);
    expect(backoffDelayMs(3, { random: noJitter })).toBe(4000);
    expect(backoffDelayMs(4, { random: noJitter })).toBe(8000);
    expect(backoffDelayMs(5, { random: noJitter })).toBe(16000);
  });

  it("caps the delay at maxMs", () => {
    expect(backoffDelayMs(6, { random: noJitter })).toBe(MAX_BACKOFF_MS);
    expect(backoffDelayMs(20, { random: noJitter })).toBe(MAX_BACKOFF_MS);
  });

  it("honours a custom base interval", () => {
    expect(backoffDelayMs(1, { baseMs: 10000, random: noJitter })).toBe(10000);
    expect(backoffDelayMs(2, { baseMs: 10000, random: noJitter })).toBe(20000);
    expect(backoffDelayMs(3, { baseMs: 10000, random: noJitter })).toBe(30000);
  });

  it("applies at most ±jitterRatio of jitter", () => {
    // random() === 0 -> lower bound, random() === 1 (approx) -> upper bound.
    const nominal = BASE_BACKOFF_MS * 2; // failureCount 2
    const low = backoffDelayMs(2, { random: () => 0 });
    const high = backoffDelayMs(2, { random: () => 0.999999 });
    expect(low).toBeGreaterThanOrEqual(nominal * (1 - JITTER_RATIO));
    expect(low).toBeLessThan(nominal);
    expect(high).toBeGreaterThan(nominal);
    expect(high).toBeLessThanOrEqual(nominal * (1 + JITTER_RATIO));
  });

  it("never returns a negative delay", () => {
    for (let i = 1; i <= 10; i += 1) {
      expect(backoffDelayMs(i, { random: () => 0 })).toBeGreaterThanOrEqual(0);
    }
  });
});
