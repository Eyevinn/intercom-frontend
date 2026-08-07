import { describe, it, expect, vi, afterEach } from "vitest";
import { readReturnTo, readOidcConfig } from "./oidc-settings";

const AUTHORITY = "https://keycloak.example.com/realms/dmf";

const configured = (overrides: Record<string, unknown> = {}) => ({
  VITE_OIDC_ENABLED: "true",
  VITE_OIDC_AUTHORITY: AUTHORITY,
  VITE_OIDC_CLIENT_ID: "intercom",
  ...overrides,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readOidcConfig", () => {
  it("is disabled when the flag is absent", () => {
    expect(readOidcConfig({}).enabled).toBe(false);
  });

  it.each(["true", "TRUE", "1", "yes", "on"])("treats %s as on", (value) => {
    expect(
      readOidcConfig(configured({ VITE_OIDC_ENABLED: value })).enabled
    ).toBe(true);
  });

  it.each(["false", "0", "no", ""])("treats %s as off", (value) => {
    expect(
      readOidcConfig(configured({ VITE_OIDC_ENABLED: value })).enabled
    ).toBe(false);
  });

  it("stays disabled and complains when the flag is on but config is missing", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(readOidcConfig({ VITE_OIDC_ENABLED: "true" }).enabled).toBe(false);
    expect(
      readOidcConfig({
        VITE_OIDC_ENABLED: "true",
        VITE_OIDC_AUTHORITY: AUTHORITY,
      }).enabled
    ).toBe(false);
    expect(error).toHaveBeenCalled();
  });

  it("strips a trailing slash from the authority", () => {
    expect(
      readOidcConfig(configured({ VITE_OIDC_AUTHORITY: `${AUTHORITY}/` }))
        .authority
    ).toBe(AUTHORITY);
  });

  it("defaults the redirect URI to the browser origin", () => {
    expect(readOidcConfig(configured()).redirectUri).toBe(
      window.location.origin
    );
  });

  it("honours an explicit redirect URI and scope", () => {
    const config = readOidcConfig(
      configured({
        VITE_OIDC_REDIRECT_URI: "http://localhost:5173",
        VITE_OIDC_SCOPE: "openid",
      })
    );
    expect(config.redirectUri).toBe("http://localhost:5173");
    expect(config.scope).toBe("openid");
  });

  it("defaults the scope to openid profile email", () => {
    expect(readOidcConfig(configured()).scope).toBe("openid profile email");
  });
});

describe("readReturnTo", () => {
  it("accepts a relative path", () => {
    expect(readReturnTo({ returnTo: "/calls?callId=1" })).toBe(
      "/calls?callId=1"
    );
  });

  it("rejects anything that could redirect off-site", () => {
    expect(readReturnTo({ returnTo: "//evil.example.com" })).toBeUndefined();
    expect(
      readReturnTo({ returnTo: "https://evil.example.com" })
    ).toBeUndefined();
    expect(readReturnTo({ returnTo: "calls" })).toBeUndefined();
  });

  it("ignores absent or malformed state", () => {
    expect(readReturnTo(undefined)).toBeUndefined();
    expect(readReturnTo(null)).toBeUndefined();
    expect(readReturnTo("/calls")).toBeUndefined();
    expect(readReturnTo({})).toBeUndefined();
    expect(readReturnTo({ returnTo: 42 })).toBeUndefined();
  });
});
