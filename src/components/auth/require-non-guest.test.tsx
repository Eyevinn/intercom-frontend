import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { RequireNonGuest } from "./require-non-guest";

const mockUseIsGuest = vi.fn();
vi.mock("../../hooks/use-is-guest", () => ({
  useIsGuest: () => mockUseIsGuest(),
}));

const mockGetPath = vi.fn();
vi.mock("../../utils/guest-session", () => ({
  guestSession: {
    getPath: () => mockGetPath(),
  },
}));

afterEach(() => {
  mockUseIsGuest.mockReset();
  mockGetPath.mockReset();
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={
            <RequireNonGuest>
              <div>Landing page</div>
            </RequireNonGuest>
          }
        />
        <Route path="/calls" element={<div>Calls page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("RequireNonGuest", () => {
  it("renders children for a normal user", () => {
    mockUseIsGuest.mockReturnValue(false);

    renderAt("/");

    expect(screen.getByText("Landing page")).toBeInTheDocument();
  });

  it("redirects a guest to their invited path", () => {
    mockUseIsGuest.mockReturnValue(true);
    mockGetPath.mockReturnValue("/calls?lines=p:l&guest=1");

    renderAt("/");

    expect(screen.queryByText("Landing page")).toBeNull();
    expect(screen.getByText("Calls page")).toBeInTheDocument();
  });

  it("falls back to /calls when no invited path was stored", () => {
    mockUseIsGuest.mockReturnValue(true);
    mockGetPath.mockReturnValue(null);

    renderAt("/");

    expect(screen.queryByText("Landing page")).toBeNull();
    expect(screen.getByText("Calls page")).toBeInTheDocument();
  });
});
