import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// react-router hooks are mocked so we can control searchParams and capture navigate calls
const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

// Import after mocking so the module picks up the mocks
const { useCallsNavigation } = await import("./use-calls-navigation");

describe("useCallsNavigation", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSearchParams = new URLSearchParams();
    Object.defineProperty(window, "location", {
      value: { pathname: "/lines", search: "" },
      writable: true,
    });
  });

  describe("URL-update effect — program line ref preservation", () => {
    it("preserves pending program line refs in the URL when some calls have joined but program lines are still pending", async () => {
      // Simulate a state where the current URL only has line 10 (line 20 is still
      // a pending program card that has not yet appeared in the URL).
      mockSearchParams = new URLSearchParams("lines=1:10");
      Object.defineProperty(window, "location", {
        value: { pathname: "/lines", search: "?lines=1:10" },
        writable: true,
      });

      // Only line 10 has joined so far; line 20 is still a pending program card
      const calls = {
        "call-a": {
          joinProductionOptions: { productionId: "1", lineId: "10" },
        },
      };
      const pendingProgramLineRefs = [{ productionId: "1", lineId: "20" }];

      const { rerender } = renderHook(() =>
        useCallsNavigation({
          isEmpty: false,
          calls,
          pendingProgramLineRefs,
        })
      );

      // Flush effects
      await act(async () => {});

      // The hook must add line 20 to the URL so the program card is not lost
      const navigatedUrl: string = mockNavigate.mock.calls[0]?.[0] ?? "";
      expect(navigatedUrl).toContain("1:10");
      expect(navigatedUrl).toContain("1:20");

      // Suppress rerender warning — clean up
      rerender();
    });

    it("does not change the URL when a program line ref has joined and is no longer pending", async () => {
      mockSearchParams = new URLSearchParams("lines=1:10,1:20");
      Object.defineProperty(window, "location", {
        value: { pathname: "/lines", search: "?lines=1:10,1:20" },
        writable: true,
      });

      // Both lines have now joined; pendingProgramLineRefs is empty (card was dismissed)
      const calls = {
        "call-a": {
          joinProductionOptions: { productionId: "1", lineId: "10" },
        },
        "call-b": {
          joinProductionOptions: { productionId: "1", lineId: "20" },
        },
      };

      const { rerender } = renderHook(() =>
        useCallsNavigation({
          isEmpty: false,
          calls,
          pendingProgramLineRefs: [],
        })
      );

      await act(async () => {});

      // Both lines are joined and in the URL already — no navigation needed
      expect(mockNavigate).not.toHaveBeenCalled();

      rerender();
    });

    it("appends extra joined calls that were not in the original URL (added via Add Call)", async () => {
      // Original URL only had line 10
      mockSearchParams = new URLSearchParams("lines=1:10");
      Object.defineProperty(window, "location", {
        value: { pathname: "/lines", search: "?lines=1:10" },
        writable: true,
      });

      // User also joined line 30 via "Add Call" — it is not in pendingCallRefs
      const calls = {
        "call-a": {
          joinProductionOptions: { productionId: "1", lineId: "10" },
        },
        "call-c": {
          joinProductionOptions: { productionId: "1", lineId: "30" },
        },
      };

      const { rerender } = renderHook(() =>
        useCallsNavigation({
          isEmpty: false,
          calls,
          pendingProgramLineRefs: [],
        })
      );

      await act(async () => {});

      const navigatedUrl: string = mockNavigate.mock.calls[0]?.[0] ?? "";
      expect(navigatedUrl).toContain("1:10");
      expect(navigatedUrl).toContain("1:30");

      rerender();
    });
  });

  describe("companion URL preservation", () => {
    it("preserves the companion query param when rebuilding the URL", async () => {
      // Simulate the state after handleCompanionUrlChange has already written
      // ?companion= into window.location (the live URL) but a calls-state change
      // also fires the URL-sync effect.  The effect must read from window.location
      // (not from the React searchParams snapshot) so it does not strip the param.
      mockSearchParams = new URLSearchParams("lines=1:10");
      // window.location already contains the companion param — the source of truth
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/lines",
          search: "?lines=1:10&companion=localhost:9000",
        },
        writable: true,
      });

      const calls = {
        "call-a": {
          joinProductionOptions: { productionId: "1", lineId: "10" },
        },
        "call-b": {
          joinProductionOptions: { productionId: "1", lineId: "20" },
        },
      };

      const { rerender } = renderHook(() =>
        useCallsNavigation({
          isEmpty: false,
          calls,
          pendingProgramLineRefs: [],
        })
      );

      await act(async () => {});

      const navigatedUrl: string = mockNavigate.mock.calls[0]?.[0] ?? "";
      expect(navigatedUrl).toContain("companion=localhost:9000");

      rerender();
    });

    it("does not strip the companion param added by handleCompanionUrlChange when calls state changes shortly after", async () => {
      // This is the exact bug scenario: the user connects WebSocket, which calls
      // navigate("?lines=1:10&companion=host:9000") via handleCompanionUrlChange.
      // Before the next render cycle the calls-state effect fires.  It must read
      // the companion from window.location (already updated) rather than from the
      // stale React searchParams (which still lacks the companion param).
      mockSearchParams = new URLSearchParams("lines=1:10"); // stale — no companion yet
      Object.defineProperty(window, "location", {
        value: {
          pathname: "/lines",
          search: "?lines=1:10&companion=host:9000",
        },
        writable: true,
      });

      const calls = {
        "call-a": {
          joinProductionOptions: { productionId: "1", lineId: "10" },
        },
      };

      renderHook(() =>
        useCallsNavigation({
          isEmpty: false,
          calls,
          pendingProgramLineRefs: [],
        })
      );

      await act(async () => {});

      // The URL already matches window.location so no navigate should be called,
      // but if it is (e.g. due to an extra call), it must still carry the companion.
      const navigatedUrl: string = mockNavigate.mock.calls[0]?.[0] ?? "";
      if (navigatedUrl) {
        expect(navigatedUrl).toContain("companion=host:9000");
      }
      // The companion param must not have been stripped by a navigate call
      const strippedCalls = mockNavigate.mock.calls.filter(
        (args: unknown[]) => {
          const url = args[0] as string | undefined;
          return url && !url.includes("companion");
        }
      );
      expect(strippedCalls).toHaveLength(0);
    });
  });

  describe("no-navigate guard", () => {
    it("does not call navigate when the URL already matches the current call state", async () => {
      // URL already encodes the single joined call — no update needed
      mockSearchParams = new URLSearchParams("lines=1:10");

      const calls = {
        "call-a": {
          joinProductionOptions: { productionId: "1", lineId: "10" },
        },
      };

      // Mock window.location so the hook's guard detects no change
      Object.defineProperty(window, "location", {
        value: { pathname: "/lines", search: "?lines=1:10" },
        writable: true,
      });

      renderHook(() =>
        useCallsNavigation({
          isEmpty: false,
          calls,
          pendingProgramLineRefs: [],
        })
      );

      await act(async () => {});

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
