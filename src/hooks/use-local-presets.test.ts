import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocalPresets } from "./use-local-presets";

const STORAGE_KEY = "openintercom:local-presets";

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe("useLocalPresets", () => {
  it("reads presets persisted in sessionStorage", () => {
    const stored = [
      {
        _id: "local_1",
        name: "Preset A",
        calls: [],
        createdAt: new Date().toISOString(),
      },
    ];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useLocalPresets());

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe("Preset A");
    expect(result.current.presets[0].isLocal).toBe(true);
  });

  it("writes created presets to sessionStorage, not localStorage", () => {
    const { result } = renderHook(() => useLocalPresets());

    act(() => {
      result.current.createPreset("New Preset", []);
    });

    const raw = sessionStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw ?? "[]");
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("New Preset");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("round-trips updates and deletes through sessionStorage", () => {
    const { result } = renderHook(() => useLocalPresets());

    act(() => {
      result.current.createPreset("Preset A", []);
    });
    // eslint-disable-next-line no-underscore-dangle
    const id = result.current.presets[0]._id;

    act(() => {
      result.current.updatePreset(id, { name: "Preset A renamed" });
    });
    expect(result.current.presets[0].name).toBe("Preset A renamed");

    act(() => {
      result.current.deletePreset(id);
    });
    expect(result.current.presets).toHaveLength(0);
    expect(
      JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]")
    ).toHaveLength(0);
  });

  it("returns an empty list when sessionStorage holds invalid JSON", () => {
    sessionStorage.setItem(STORAGE_KEY, "{not json");

    const { result } = renderHook(() => useLocalPresets());

    expect(result.current.presets).toEqual([]);
  });
});
