/* eslint-disable no-underscore-dangle -- exercising the `window.__ENV__`
   runtime-config global (see runtime-config.ts). */
import { describe, it, expect, vi, afterEach } from "vitest";
import { getBackendUrl, getAuthUrl, getIceServers } from "./runtime-config.ts";

const DEFAULT_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.__ENV__;
});

describe("getBackendUrl", () => {
  it("prefers the runtime window.__ENV__ value over build-time env", () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://build-time.example.com/");
    window.__ENV__ = { MANAGER_URL: "https://runtime.example.com/" };

    expect(getBackendUrl()).toBe("https://runtime.example.com");
  });

  it("falls back to the build-time VITE_BACKEND_URL when runtime is unset", () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://build-time.example.com/");

    expect(getBackendUrl()).toBe("https://build-time.example.com");
  });

  it("ignores an empty runtime value and falls through", () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://build-time.example.com/");
    window.__ENV__ = { MANAGER_URL: "" };

    expect(getBackendUrl()).toBe("https://build-time.example.com");
  });

  it("falls back to window.location.origin when nothing is configured", () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);

    expect(getBackendUrl()).toBe(window.location.origin.replace(/\/+$/, ""));
  });

  it("strips trailing slashes, so a '/' root resolves to same-origin relative", () => {
    window.__ENV__ = { MANAGER_URL: "/" };

    expect(getBackendUrl()).toBe("");
  });
});

describe("getAuthUrl", () => {
  it("prefers the runtime window.__ENV__ AUTH value", () => {
    vi.stubEnv("AUTH", "https://build-time.example.com/login");
    window.__ENV__ = { AUTH: "https://runtime.example.com/login" };

    expect(getAuthUrl()).toBe("https://runtime.example.com/login");
  });

  it("falls back to the build-time AUTH value", () => {
    vi.stubEnv("AUTH", "https://build-time.example.com/login");

    expect(getAuthUrl()).toBe("https://build-time.example.com/login");
  });

  it("returns an empty string when AUTH is unset at runtime and build time", () => {
    vi.stubEnv("AUTH", "");

    expect(getAuthUrl()).toBe("");
  });
});

describe("getIceServers", () => {
  it("falls back to the Google STUN defaults when nothing is configured", () => {
    vi.stubEnv("VITE_ICE_SERVERS", undefined);

    expect(getIceServers()).toEqual(DEFAULT_ICE_SERVERS);
  });

  it("parses the build-time VITE_ICE_SERVERS JSON array", () => {
    const servers = [
      { urls: "stun:stun.example.com:3478" },
      {
        urls: "turn:turn.example.com:3478",
        username: "user",
        credential: "pass",
      },
    ];
    vi.stubEnv("VITE_ICE_SERVERS", JSON.stringify(servers));

    expect(getIceServers()).toEqual(servers);
  });

  it("prefers the runtime window.__ENV__ value over build-time env", () => {
    vi.stubEnv(
      "VITE_ICE_SERVERS",
      JSON.stringify([{ urls: "stun:build-time.example.com:3478" }])
    );
    window.__ENV__ = {
      ICE_SERVERS: JSON.stringify([{ urls: "stun:runtime.example.com:3478" }]),
    };

    expect(getIceServers()).toEqual([
      { urls: "stun:runtime.example.com:3478" },
    ]);
  });

  it("ignores an empty runtime value and falls through to build-time env", () => {
    vi.stubEnv(
      "VITE_ICE_SERVERS",
      JSON.stringify([{ urls: "stun:build-time.example.com:3478" }])
    );
    window.__ENV__ = { ICE_SERVERS: "" };

    expect(getIceServers()).toEqual([
      { urls: "stun:build-time.example.com:3478" },
    ]);
  });

  it("falls back to the defaults for malformed JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("VITE_ICE_SERVERS", "not-json");

    expect(getIceServers()).toEqual(DEFAULT_ICE_SERVERS);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("falls back to the defaults for a non-array JSON value", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("VITE_ICE_SERVERS", JSON.stringify({ urls: "stun:x:3478" }));

    expect(getIceServers()).toEqual(DEFAULT_ICE_SERVERS);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("falls back to the defaults for an empty JSON array", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("VITE_ICE_SERVERS", "[]");

    expect(getIceServers()).toEqual(DEFAULT_ICE_SERVERS);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
