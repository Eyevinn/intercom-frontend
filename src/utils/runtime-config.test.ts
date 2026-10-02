/* eslint-disable no-underscore-dangle -- exercising the `window.__ENV__`
   runtime-config global (see runtime-config.ts). */
import { describe, it, expect, vi, afterEach } from "vitest";
import { getBackendUrl, getAuthUrl } from "./runtime-config.ts";

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
