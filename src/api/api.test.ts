import { describe, it, expect, vi, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Regression test for #646
//
// When VITE_BACKEND_URL is not set at build time, evaluating the module must
// not throw a TypeError. The intended fallback to window.location.origin has
// to take over instead of crashing during module evaluation.
// ---------------------------------------------------------------------------

describe("api module URL resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does not throw at module load when VITE_BACKEND_URL is undefined", async () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);
    vi.resetModules();

    await expect(import("./api.ts")).resolves.toBeDefined();
  });

  it("still resolves when VITE_BACKEND_URL is set", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://example.com/");
    vi.resetModules();

    const mod = await import("./api.ts");
    expect(mod.API).toBeDefined();
  });
});
