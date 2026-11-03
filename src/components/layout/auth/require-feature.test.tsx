import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { RequireFeature } from "./require-feature";
import { useGlobalState } from "../../../global-state/context-provider";
import { getRequireAuth } from "../../../utils/runtime-config";

vi.mock("../../../global-state/context-provider", () => ({
  useGlobalState: vi.fn(),
}));

vi.mock("../../../utils/runtime-config", () => ({
  getRequireAuth: vi.fn(),
}));

const mockUseGlobalState = vi.mocked(useGlobalState);
const mockGetRequireAuth = vi.mocked(getRequireAuth);

const features = {
  canCreateProduction: true,
  canEditProduction: false,
  canDeleteProduction: false,
  canManageLines: false,
  canRemoveParticipants: false,
  canManageIngests: false,
  canJoinLine: false,
};

const setRoleAuth = (roleAuth: unknown) =>
  mockUseGlobalState.mockReturnValue([
    { roleAuth },
    vi.fn(),
  ] as unknown as ReturnType<typeof useGlobalState>);

afterEach(() => {
  vi.clearAllMocks();
});

const renderGuard = (
  feature: Parameters<typeof RequireFeature>[0]["feature"]
) =>
  render(
    <MemoryRouter initialEntries={["/create"]}>
      <Routes>
        <Route
          path="/create"
          element={
            <RequireFeature feature={feature}>
              <div>Restricted page</div>
            </RequireFeature>
          }
        />
        <Route path="/" element={<div>Landing page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("RequireFeature", () => {
  it("renders children when the held role grants the feature", () => {
    setRoleAuth({ role: "admin", features });

    renderGuard("canCreateProduction");

    expect(screen.getByText("Restricted page")).toBeInTheDocument();
  });

  it("redirects to landing when the held role lacks the feature", () => {
    setRoleAuth({ role: "participant", features });

    renderGuard("canEditProduction");

    expect(screen.queryByText("Restricted page")).toBeNull();
    expect(screen.getByText("Landing page")).toBeInTheDocument();
  });

  it("allows access when no role is held and REQUIRE_AUTH is off (dormant)", () => {
    setRoleAuth(null);
    mockGetRequireAuth.mockReturnValue(false);

    renderGuard("canEditProduction");

    expect(screen.getByText("Restricted page")).toBeInTheDocument();
  });

  it("redirects when no role is held but REQUIRE_AUTH is on", () => {
    setRoleAuth(null);
    mockGetRequireAuth.mockReturnValue(true);

    renderGuard("canEditProduction");

    expect(screen.queryByText("Restricted page")).toBeNull();
    expect(screen.getByText("Landing page")).toBeInTheDocument();
  });
});
