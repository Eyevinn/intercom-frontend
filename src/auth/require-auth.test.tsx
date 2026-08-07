import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockUseAuth = vi.fn();
vi.mock("react-oidc-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockOidcConfig = { enabled: true, authority: "https://kc/realms/dmf" };
vi.mock("./oidc-settings.ts", () => ({
  get oidcConfig() {
    return mockOidcConfig;
  },
  currentLocation: () => "/calls?callId=1",
}));

// eslint-disable-next-line import/first
import { RequireAuth } from "./require-auth";

const authState = (overrides = {}) => ({
  isLoading: false,
  isAuthenticated: false,
  activeNavigator: undefined,
  error: undefined,
  signinRedirect: vi.fn(),
  ...overrides,
});

const Protected = () => <div>protected content</div>;

beforeEach(() => {
  mockOidcConfig.enabled = true;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("RequireAuth", () => {
  it("renders children without a provider when OIDC is disabled", () => {
    mockOidcConfig.enabled = false;
    render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );
    expect(screen.getByText("protected content")).toBeInTheDocument();
    expect(mockUseAuth).not.toHaveBeenCalled();
  });

  it("redirects to Keycloak carrying the current location", () => {
    const state = authState();
    mockUseAuth.mockReturnValue(state);

    render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );

    expect(state.signinRedirect).toHaveBeenCalledWith({
      state: { returnTo: "/calls?callId=1" },
    });
    expect(screen.queryByText("protected content")).not.toBeInTheDocument();
  });

  it("redirects only once across re-renders", () => {
    const state = authState();
    mockUseAuth.mockReturnValue(state);

    const { rerender } = render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );
    rerender(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );
    rerender(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );

    expect(state.signinRedirect).toHaveBeenCalledTimes(1);
  });

  it("waits instead of redirecting while the session is loading", () => {
    const state = authState({ isLoading: true });
    mockUseAuth.mockReturnValue(state);

    render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );

    expect(state.signinRedirect).not.toHaveBeenCalled();
  });

  it("does not redirect while a navigator is already running", () => {
    const state = authState({ activeNavigator: "signinRedirect" });
    mockUseAuth.mockReturnValue(state);

    render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );

    expect(state.signinRedirect).not.toHaveBeenCalled();
  });

  it("shows the failure and does not loop when sign in errors", () => {
    const state = authState({ error: new Error("invalid_client") });
    mockUseAuth.mockReturnValue(state);

    render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );

    expect(state.signinRedirect).not.toHaveBeenCalled();
    expect(screen.getByText("Sign in failed")).toBeInTheDocument();
    expect(screen.getByText(/invalid_client/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });

  it("renders the app once authenticated", () => {
    const state = authState({ isAuthenticated: true });
    mockUseAuth.mockReturnValue(state);

    render(
      <RequireAuth>
        <Protected />
      </RequireAuth>
    );

    expect(screen.getByText("protected content")).toBeInTheDocument();
    expect(state.signinRedirect).not.toHaveBeenCalled();
  });
});
