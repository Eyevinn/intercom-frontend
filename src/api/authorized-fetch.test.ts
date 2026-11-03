import { describe, it, expect, afterEach, vi } from "vitest";
import { authorizedFetch } from "./authorized-fetch.ts";
import {
  clearRoleAuth,
  getRoleAuth,
  onRoleAuthCleared,
  setRoleAuth,
  type TFeatureFlags,
} from "./role-auth-store.ts";

const features: TFeatureFlags = {
  canCreateProduction: true,
  canEditProduction: true,
  canDeleteProduction: true,
  canManageLines: true,
  canRemoveParticipants: true,
  canManageIngests: true,
  canJoinLine: true,
};

afterEach(() => {
  clearRoleAuth();
  vi.unstubAllGlobals();
});

describe("authorizedFetch 401 handling", () => {
  it("clears stored role auth and notifies listeners on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401 }));
    setRoleAuth({ password: "old", role: "admin", features });
    const listener = vi.fn();
    const off = onRoleAuthCleared(listener);

    await authorizedFetch("/x");

    expect(getRoleAuth()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    off();
  });

  it("keeps stored role auth on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
    setRoleAuth({ password: "ok", role: "admin", features });
    await authorizedFetch("/x");
    expect(getRoleAuth()).not.toBeNull();
  });
});
