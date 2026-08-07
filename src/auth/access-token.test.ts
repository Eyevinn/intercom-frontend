import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";

const loadModule = async () => {
  vi.resetModules();
  return import("./access-token");
};

describe("authHeaders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe("with no static API key", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_BACKEND_API_KEY", "");
    });

    it("sends no Authorization header when nobody is signed in", async () => {
      const { authHeaders } = await loadModule();
      expect(authHeaders()).toEqual({});
    });

    it("sends the OIDC access token once a provider is registered", async () => {
      const { authHeaders, setAccessTokenProvider } = await loadModule();
      setAccessTokenProvider(() => "access-token-1");
      expect(authHeaders()).toEqual({ Authorization: "Bearer access-token-1" });
    });

    it("reads the token on every call, so a renewed token is picked up", async () => {
      const { authHeaders, setAccessTokenProvider } = await loadModule();
      let token = "first";
      setAccessTokenProvider(() => token);
      expect(authHeaders()).toEqual({ Authorization: "Bearer first" });

      token = "second";
      expect(authHeaders()).toEqual({ Authorization: "Bearer second" });
    });

    it("drops the header again when the provider is unregistered", async () => {
      const { authHeaders, setAccessTokenProvider } = await loadModule();
      setAccessTokenProvider(() => "access-token-1");
      setAccessTokenProvider(undefined);
      expect(authHeaders()).toEqual({});
    });
  });

  describe("with a static API key configured", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_BACKEND_API_KEY", "static-key");
    });

    it("falls back to the API key when OIDC is not in play", async () => {
      const { authHeaders } = await loadModule();
      expect(authHeaders()).toEqual({ Authorization: "Bearer static-key" });
    });

    it("prefers the OIDC token over the API key", async () => {
      const { authHeaders, setAccessTokenProvider } = await loadModule();
      setAccessTokenProvider(() => "access-token-1");
      expect(authHeaders()).toEqual({ Authorization: "Bearer access-token-1" });
    });

    it("falls back to the API key while the token is momentarily absent", async () => {
      const { authHeaders, setAccessTokenProvider } = await loadModule();
      setAccessTokenProvider(() => undefined);
      expect(authHeaders()).toEqual({ Authorization: "Bearer static-key" });
    });
  });
});
