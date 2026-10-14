import { describe, it, expect, afterEach, vi } from "vitest";
import {
  resolveIceServers,
  DEFAULT_ICE_SERVERS,
} from "./use-rtc-connection.ts";

describe("resolveIceServers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to the default Google STUN servers when unset", () => {
    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
    expect(resolveIceServers()).toEqual([
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ]);
  });

  it("uses a valid JSON array of RTCIceServer objects as-is", () => {
    const iceServers = [
      { urls: "stun:stun.example.com:3478" },
      {
        urls: ["turn:turn.example.com:3478"],
        username: "user",
        credential: "pass",
      },
    ];

    vi.stubEnv("VITE_ICE_SERVERS", JSON.stringify(iceServers));

    expect(resolveIceServers()).toEqual(iceServers);
  });

  it("falls back on malformed JSON without throwing", () => {
    vi.stubEnv("VITE_ICE_SERVERS", "{not valid json");

    expect(() => resolveIceServers()).not.toThrow();
    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("falls back when the JSON is not an array", () => {
    vi.stubEnv(
      "VITE_ICE_SERVERS",
      JSON.stringify({ urls: "stun:stun.example.com:3478" })
    );

    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("falls back when the array is empty", () => {
    vi.stubEnv("VITE_ICE_SERVERS", "[]");

    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("falls back for string elements without throwing", () => {
    vi.stubEnv(
      "VITE_ICE_SERVERS",
      JSON.stringify(["stun:stun.l.google.com:19302"])
    );

    expect(() => resolveIceServers()).not.toThrow();
    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("falls back for objects missing a urls field ([{}])", () => {
    vi.stubEnv("VITE_ICE_SERVERS", "[{}]");

    expect(() => resolveIceServers()).not.toThrow();
    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("falls back for numeric elements ([1,2,3])", () => {
    vi.stubEnv("VITE_ICE_SERVERS", "[1,2,3]");

    expect(() => resolveIceServers()).not.toThrow();
    expect(resolveIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });
});
