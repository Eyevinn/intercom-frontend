import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePresets } from "./use-presets";
import { TPreset, API } from "../api/api";

// Mock the API module
vi.mock("../api/api", () => ({
  API: {
    listPresets: vi.fn(),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
    updatePreset: vi.fn(),
  },
}));

// Mock useGlobalState — reloadPresetList starts false; dispatch is captured per test
const mockDispatch = vi.fn();
vi.mock("../global-state/context-provider", () => ({
  useGlobalState: vi.fn(() => [{ reloadPresetList: false }, mockDispatch]),
}));

// Mock useLocalPresets to keep this test focused on public preset logic
vi.mock("./use-local-presets", () => ({
  useLocalPresets: vi.fn(() => ({
    presets: [],
    createPreset: vi.fn(),
    updatePreset: vi.fn(),
    deletePreset: vi.fn(),
  })),
}));

const mockAPI = API as unknown as {
  listPresets: ReturnType<typeof vi.fn>;
  createPreset: ReturnType<typeof vi.fn>;
  deletePreset: ReturnType<typeof vi.fn>;
  updatePreset: ReturnType<typeof vi.fn>;
};

const makePreset = (id: string, name: string): TPreset => ({
  _id: id,
  name,
  calls: [],
  createdAt: new Date().toISOString(),
});

describe("usePresets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAPI.listPresets.mockResolvedValue({ presets: [] });
    mockDispatch.mockClear();
  });

  describe("createPublicPreset", () => {
    it("calls API.createPreset and dispatches PRESET_UPDATED to trigger an immediate re-fetch", async () => {
      const existingPreset = makePreset("p1", "Existing");
      mockAPI.listPresets.mockResolvedValue({ presets: [existingPreset] });

      mockAPI.createPreset.mockResolvedValue(makePreset("p2", "New Preset"));

      const { result } = renderHook(() => usePresets());

      // Wait for initial listPresets to resolve
      await act(async () => {});

      expect(result.current.presets).toContainEqual(
        expect.objectContaining({ _id: "p1" })
      );

      await act(async () => {
        await result.current.createPublicPreset({
          name: "New Preset",
          calls: [{ productionId: "prod1", lineId: "line1" }],
        });
      });

      // createPreset must be called with the correct arguments
      expect(mockAPI.createPreset).toHaveBeenCalledWith({
        name: "New Preset",
        calls: [{ productionId: "prod1", lineId: "line1" }],
        companionUrl: undefined,
      });
      // Dispatch must be called with PRESET_UPDATED to trigger re-fetch of the list
      expect(mockDispatch).toHaveBeenCalledWith({ type: "PRESET_UPDATED" });
    });

    it("passes companionUrl through to API.createPreset when provided", async () => {
      const newPreset = makePreset("p3", "With Companion");
      mockAPI.createPreset.mockResolvedValue(newPreset);

      const { result } = renderHook(() => usePresets());
      await act(async () => {});

      await act(async () => {
        await result.current.createPublicPreset({
          name: "With Companion",
          calls: [],
          companionUrl: "ws://localhost:12345",
        });
      });

      expect(mockAPI.createPreset).toHaveBeenCalledWith(
        expect.objectContaining({ companionUrl: "ws://localhost:12345" })
      );
    });

    it("propagates API errors to the caller rather than swallowing them", async () => {
      const apiError = new Error("Server error");
      mockAPI.createPreset.mockRejectedValue(apiError);

      const { result } = renderHook(() => usePresets());
      await act(async () => {});

      await expect(
        act(async () => {
          await result.current.createPublicPreset({
            name: "Bad Preset",
            calls: [],
          });
        })
      ).rejects.toThrow("Server error");

      // publicPresets should remain unchanged after a failed create
      expect(result.current.presets.filter((p) => !p.isLocal)).toHaveLength(0);
    });
  });

  describe("reloadPresetList effect", () => {
    it("re-fetches the preset list when reloadPresetList becomes true and resets the flag", async () => {
      const { useGlobalState } =
        await import("../global-state/context-provider");
      const mockUseGlobalState = useGlobalState as ReturnType<typeof vi.fn>;

      // First render: reloadPresetList = false
      mockUseGlobalState.mockReturnValue([
        { reloadPresetList: false },
        mockDispatch,
      ]);

      const updatedPreset = makePreset("p99", "Refreshed");
      mockAPI.listPresets.mockResolvedValue({ presets: [updatedPreset] });

      const { result, rerender } = renderHook(() => usePresets());
      await act(async () => {});

      // Simulate reloadPresetList flipping to true (e.g. after createPublicPreset)
      mockUseGlobalState.mockReturnValue([
        { reloadPresetList: true },
        mockDispatch,
      ]);
      rerender();
      await act(async () => {});

      // The reload effect dispatches PRESET_LIST_FETCHED to reset the flag
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "PRESET_LIST_FETCHED",
      });
      // The public preset list is updated with the fresh API response
      expect(result.current.presets).toContainEqual(
        expect.objectContaining({ _id: "p99" })
      );
    });
  });
});
