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
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useCallsNavigation } from "./use-calls-navigation.tsx";

// Wrap hooks in a real MemoryRouter so that useNavigate() resolves its context
// through the actual react-router-dom package — the same path that was broken
// when two conflicting router versions existed side-by-side.
const wrapper =
  (initialEntries: string[] = ["/"]) =>
  ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries }, children);

describe("useCallsNavigation", () => {
  // ── Basic instantiation ───────────────────────────────────────────────────

  it("renders without throwing inside a Router (regression: dual react-router versions)", () => {
    // If two react-router versions are present, useNavigate() throws on render.
    // This test catches that regression.
    expect(() => {
      renderHook(
        () =>
          useCallsNavigation({
            isEmpty: false,
            paramProductionId: "prod-1",
            paramLineId: "line-1",
          }),
        {
          wrapper: wrapper([
            "/production-calls/production/prod-1/line/line-1",
          ]),
        },
      );
    }).not.toThrow();
  });

  it("returns a navigate function", () => {
    const { result } = renderHook(
      () =>
        useCallsNavigation({
          isEmpty: false,
          paramProductionId: "prod-1",
          paramLineId: "line-1",
        }),
      {
        wrapper: wrapper([
          "/production-calls/production/prod-1/line/line-1",
        ]),
      },
    );

    expect(typeof result.current).toBe("function");
  });

  // ── Navigation behaviour ──────────────────────────────────────────────────

  it("navigates to '/' when isEmpty=true and no production/line params are present", () => {
    // Capture the current location by co-rendering a helper hook in the same
    // MemoryRouter context via a composite hook.
    let capturedPathname = "/start";

    const LocationCapture = () => {
      const loc = useLocation();
      capturedPathname = loc.pathname;
      return null;
    };

    // Render a wrapper that houses both the hook under test and the location
    // probe in the same MemoryRouter.
    const WrapperWithProbe = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/production-calls"] },
        createElement(LocationCapture, null),
        children,
      );

    renderHook(
      () =>
        useCallsNavigation({
          isEmpty: true,
          paramProductionId: undefined,
          paramLineId: undefined,
        }),
      { wrapper: WrapperWithProbe },
    );

    // After the useEffect fires, the router should have navigated to "/".
    expect(capturedPathname).toBe("/");
  });

  it("does NOT navigate when isEmpty=true but paramProductionId is set", () => {
    // When a production ID is present the hook must not redirect — it waits for
    // the data to arrive.
    const navigateSpy = vi.fn();
    let capturedPathname = "/production-calls/production/prod-1/line/1";

    const LocationCapture = () => {
      const loc = useLocation();
      capturedPathname = loc.pathname;
      return null;
    };

    const WrapperWithSpy = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/production-calls/production/prod-1/line/1"] },
        createElement(LocationCapture, null),
        children,
      );

    renderHook(
      () =>
        useCallsNavigation({
          isEmpty: true,
          paramProductionId: "prod-1",
          paramLineId: "1",
        }),
      { wrapper: WrapperWithSpy },
    );

    // Pathname should be unchanged — no navigation occurred.
    expect(capturedPathname).toBe(
      "/production-calls/production/prod-1/line/1",
    );
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("does NOT navigate when isEmpty=false regardless of params", () => {
    let capturedPathname = "/production-calls/production/prod-1/line/1";

    const LocationCapture = () => {
      const loc = useLocation();
      capturedPathname = loc.pathname;
      return null;
    };

    const WrapperWithCapture = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/production-calls/production/prod-1/line/1"] },
        createElement(LocationCapture, null),
        children,
      );

    renderHook(
      () =>
        useCallsNavigation({
          isEmpty: false,
          paramProductionId: undefined,
          paramLineId: undefined,
        }),
      { wrapper: WrapperWithCapture },
    );

    expect(capturedPathname).toBe(
      "/production-calls/production/prod-1/line/1",
    );
  });

  // ── Imperative navigate returned value ───────────────────────────────────

  it("the returned navigate function is callable without throwing", () => {
    const { result } = renderHook(
      () =>
        useCallsNavigation({
          isEmpty: false,
          paramProductionId: "prod-1",
          paramLineId: "line-1",
        }),
      {
        wrapper: wrapper([
          "/production-calls/production/prod-1/line/line-1",
        ]),
      },
    );

    expect(() => {
      act(() => {
        result.current("/");
      });
    }).not.toThrow();
  });
});
