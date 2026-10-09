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

// ---------------------------------------------------------------------------
// #673 — admin force-disconnect (kick) endpoint.
// ---------------------------------------------------------------------------

describe("API.forceDisconnectParticipant", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("POSTs to the backend force-disconnect endpoint for the given ids", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://example.com/");
    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "text/plain" },
      text: async () => "Disconnected participant session-1",
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { API } = await import("./api.ts");

    const result = await API.forceDisconnectParticipant({
      productionId: "1",
      lineId: "2",
      sessionId: "session-1",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain(
      "production/1/line/2/participants/session-1/disconnect"
    );
    expect(options.method).toBe("POST");
    expect(result).toBe("Disconnected participant session-1");
  });

  it("throws with the backend message on a 404", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://example.com/");
    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => "text/plain" },
      text: async () => "Session with id session-1 not found on line 2",
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { API } = await import("./api.ts");

    await expect(
      API.forceDisconnectParticipant({
        productionId: "1",
        lineId: "2",
        sessionId: "session-1",
      })
    ).rejects.toThrow("Session with id session-1 not found on line 2");
  });
});
