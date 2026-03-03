/**
 * Regression tests for the react-router dual-version bug.
 *
 * BACKGROUND: After migrating to npm, react-router-dom@^7.13.0 resolved to
 * 7.13.1 while its transitive dependency react-router resolved to a nested
 * 7.10.1. This produced two separate Router contexts, causing:
 *   "useNavigate() may be used only in the context of a <Router> component"
 *
 * FIX: Align both react-router and react-router-dom to ^7.13.0 so npm resolves
 * a single version with no nested duplicate.
 *
 * WHY A REAL ROUTER: These tests deliberately use MemoryRouter (the real
 * react-router-dom export) instead of vi.mock("react-router-dom"). Mocking the
 * router would make the tests pass regardless of the dual-version bug because
 * the mock bypasses the Router context check entirely. Only rendering inside a
 * real Router exercises the version-sensitive context lookup that the bug broke.
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { TJoinProductionOptions } from "../production-line/types.ts";

// Wrap hooks in a real MemoryRouter so that useNavigate() resolves its context
// through the actual react-router-dom package — the same path that was broken
// when two conflicting router versions existed side-by-side.
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(MemoryRouter, { initialEntries: ["/"] }, children);

describe("useNavigateToProduction", () => {
  // ── Basic instantiation ───────────────────────────────────────────────────

  it("renders without throwing inside a Router (regression: dual react-router versions)", () => {
    // If two react-router versions are present, useNavigate() throws on render.
    // This test catches that regression.
    expect(() => {
      renderHook(() => useNavigateToProduction(null), { wrapper });
    }).not.toThrow();
  });

  it("renders without throwing when joinProductionOptions is null", () => {
    const { result } = renderHook(() => useNavigateToProduction(null), {
      wrapper,
    });

    // Hook returns undefined (void); the point is it must not throw.
    expect(result.current).toBeUndefined();
  });

  // ── Navigation behaviour ──────────────────────────────────────────────────

  it("navigates to the production-calls URL when joinProductionOptions is provided", () => {
    const options: TJoinProductionOptions = {
      productionId: "prod-42",
      lineId: "line-7",
      username: "test-user",
      lineUsedForProgramOutput: false,
      isProgramUser: false,
    };

    let capturedPathname = "/";

    const LocationCapture = () => {
      const loc = useLocation();
      capturedPathname = loc.pathname;
      return null;
    };

    // Mount both the location probe and the hook under test inside the same
    // MemoryRouter so they share one router context.
    const WrapperWithProbe = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/"] },
        createElement(LocationCapture, null),
        children,
      );

    renderHook(() => useNavigateToProduction(options), {
      wrapper: WrapperWithProbe,
    });

    // After the useEffect fires the router should have navigated to the correct
    // production-calls path.
    expect(capturedPathname).toBe(
      "/production-calls/production/prod-42/line/line-7",
    );
  });

  it("does NOT navigate when joinProductionOptions is null", () => {
    let capturedPathname = "/landing";

    const LocationCapture = () => {
      const loc = useLocation();
      capturedPathname = loc.pathname;
      return null;
    };

    const WrapperWithProbe = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/landing"] },
        createElement(LocationCapture, null),
        children,
      );

    renderHook(() => useNavigateToProduction(null), {
      wrapper: WrapperWithProbe,
    });

    // Pathname must be unchanged — no navigation should occur for null options.
    expect(capturedPathname).toBe("/landing");
  });

  it("navigates to the correct URL for a different production and line", () => {
    const options: TJoinProductionOptions = {
      productionId: "morning-show",
      lineId: "studio-a",
      username: "producer",
      lineUsedForProgramOutput: true,
      isProgramUser: false,
      lineName: "Studio A",
      productionName: "Morning Show",
    };

    let capturedPathname = "/";

    const LocationCapture = () => {
      const loc = useLocation();
      capturedPathname = loc.pathname;
      return null;
    };

    const WrapperWithProbe = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/"] },
        createElement(LocationCapture, null),
        children,
      );

    renderHook(() => useNavigateToProduction(options), {
      wrapper: WrapperWithProbe,
    });

    expect(capturedPathname).toBe(
      "/production-calls/production/morning-show/line/studio-a",
    );
  });
});
