import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveIceServers, DEFAULT_ICE_SERVERS } from "./ice-servers.ts";

describe("resolveIceServers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the Google STUN defaults when unset", () => {
    expect(resolveIceServers(undefined)).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("returns the Google STUN defaults when the value is an empty string", () => {
    expect(resolveIceServers("")).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("parses a valid JSON array of ICE servers", () => {
    const configured = JSON.stringify([
      { urls: "stun:stun.example.com:3478" },
      { urls: "turn:turn.example.com:3478", username: "u", credential: "p" },
    ]);

    expect(resolveIceServers(configured)).toEqual([
      { urls: "stun:stun.example.com:3478" },
      { urls: "turn:turn.example.com:3478", username: "u", credential: "p" },
    ]);
  });

  it("falls back to defaults and warns when the value is not valid JSON", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveIceServers("not-json")).toEqual(DEFAULT_ICE_SERVERS);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("does not throw on invalid JSON", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => resolveIceServers("{broken")).not.toThrow();
  });
});
