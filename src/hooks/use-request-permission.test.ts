import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRequestPermission } from "./use-request-permission";
import { API } from "../api/api";
import { useGlobalState } from "../global-state/context-provider";
import {
  clearRoleAuth,
  getAuthHeader,
  getRoleAuth,
  resetRoleAuthForTests,
} from "../api/role-auth-store";

vi.mock("../api/api", () => ({
  API: { requestPermissions: vi.fn() },
}));

vi.mock("../global-state/context-provider", () => ({
  useGlobalState: vi.fn(),
}));

const mockRequestPermissions = vi.mocked(API.requestPermissions);
const mockUseGlobalState = vi.mocked(useGlobalState);

const features = {
  canCreateProduction: true,
  canEditProduction: true,
  canDeleteProduction: true,
  canManageLines: true,
  canRemoveParticipants: true,
  canManageIngests: true,
  canJoinLine: true,
};

const dispatch = vi.fn();

beforeEach(() => {
  mockUseGlobalState.mockReturnValue([{}, dispatch] as unknown as ReturnType<
    typeof useGlobalState
  >);
});

afterEach(() => {
  vi.clearAllMocks();
  clearRoleAuth();
  resetRoleAuthForTests();
  window.localStorage.clear();
});

describe("useRequestPermission", () => {
  it("stores the role + features and dispatches UPDATE_ROLE_AUTH on success", async () => {
    mockRequestPermissions.mockResolvedValue({ role: "editor", features });

    const { result } = renderHook(() => useRequestPermission());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.requestPermission("good-password");
    });

    expect(ok).toBe(true);
    expect(result.current.error).toBeNull();
    // Role + features mirrored into global state (no password).
    expect(dispatch).toHaveBeenCalledWith({
      type: "UPDATE_ROLE_AUTH",
      payload: { role: "editor", features },
    });
    // Password persisted so the Authorization header can be attached.
    expect(getRoleAuth()).toEqual({ role: "editor", features });
    expect(getAuthHeader()).toEqual({ Authorization: "Bearer good-password" });
  });

  it("surfaces an invalid-password message on 401 and stores nothing", async () => {
    mockRequestPermissions.mockRejectedValue(
      Object.assign(new Error("Invalid or unknown role password"), {
        status: 401,
      })
    );

    const { result } = renderHook(() => useRequestPermission());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.requestPermission("bad");
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe("Invalid or unknown role password.");
    expect(getRoleAuth()).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("surfaces a rate-limit message on 429", async () => {
    mockRequestPermissions.mockRejectedValue(
      Object.assign(new Error("rate limited"), { status: 429 })
    );

    const { result } = renderHook(() => useRequestPermission());

    await act(async () => {
      await result.current.requestPermission("x");
    });

    expect(result.current.error).toBe(
      "Too many attempts. Please wait a minute and try again."
    );
  });

  it("clears the stored role and dispatches null", async () => {
    mockRequestPermissions.mockResolvedValue({ role: "admin", features });

    const { result } = renderHook(() => useRequestPermission());
    await act(async () => {
      await result.current.requestPermission("pw");
    });

    act(() => {
      result.current.clearPermission();
    });

    expect(getRoleAuth()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({
      type: "UPDATE_ROLE_AUTH",
      payload: null,
    });
  });
});
