import { describe, it, expect, afterEach, vi } from "vitest";
import {
  clearRoleAuth,
  getAuthHeader,
  getRoleAuth,
  hasFeature,
  resetRoleAuthForTests,
  setRoleAuth,
  type TFeatureFlags,
} from "./role-auth-store.ts";

const allowAll: TFeatureFlags = {
  canCreateProduction: true,
  canEditProduction: true,
  canDeleteProduction: true,
  canManageLines: true,
  canRemoveParticipants: true,
  canManageIngests: true,
  canJoinLine: true,
};

const denyJoin: TFeatureFlags = { ...allowAll, canJoinLine: false };

afterEach(() => {
  clearRoleAuth();
  resetRoleAuthForTests();
  window.localStorage.clear();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("role-auth-store", () => {
  it("returns no auth header and null role by default (dormant)", () => {
    expect(getRoleAuth()).toBeNull();
    expect(getAuthHeader()).toEqual({});
  });

  it("stores the granted role/features and exposes the Bearer header", () => {
    setRoleAuth({ password: "s3cret", role: "admin", features: allowAll });

    expect(getRoleAuth()).toEqual({ role: "admin", features: allowAll });
    // The password is only in the header, never in the role snapshot.
    expect(getRoleAuth()).not.toHaveProperty("password");
    expect(getAuthHeader()).toEqual({ Authorization: "Bearer s3cret" });
  });

  it("clears the stored role", () => {
    setRoleAuth({ password: "x", role: "editor", features: allowAll });
    clearRoleAuth();

    expect(getRoleAuth()).toBeNull();
    expect(getAuthHeader()).toEqual({});
  });

  it("hasFeature allows everything when no role is held and REQUIRE_AUTH is off", () => {
    expect(hasFeature("canJoinLine")).toBe(true);
    expect(hasFeature("canCreateProduction")).toBe(true);
  });

  it("hasFeature reflects the granted flags when a role is held", () => {
    setRoleAuth({ password: "p", role: "participant", features: denyJoin });

    expect(hasFeature("canJoinLine")).toBe(false);
    expect(hasFeature("canEditProduction")).toBe(true);
  });

  it("hasFeature blocks when no role is held but REQUIRE_AUTH is on", async () => {
    vi.stubEnv("VITE_REQUIRE_AUTH", "true");
    vi.resetModules();
    const mod = await import("./role-auth-store.ts");

    expect(mod.hasFeature("canJoinLine")).toBe(false);
  });
});
