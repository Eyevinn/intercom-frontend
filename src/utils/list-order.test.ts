import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyStoredOrder,
  getSavedOrder,
  reorderByIds,
  saveOrder,
} from "./list-order";

const KEY = "test-sort-order";

type TItem = { id: string };

const items = (ids: string[]): TItem[] => ids.map((id) => ({ id }));
const ids = (list: TItem[]) => list.map((i) => i.id);

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("getSavedOrder", () => {
  it("returns a stored array of ids", () => {
    localStorage.setItem(KEY, JSON.stringify(["b", "a"]));

    expect(getSavedOrder(KEY)).toEqual(["b", "a"]);
  });

  it("returns an empty array when nothing is stored", () => {
    expect(getSavedOrder(KEY)).toEqual([]);
  });

  it("returns an empty array for malformed JSON", () => {
    localStorage.setItem(KEY, "{not json");

    expect(getSavedOrder(KEY)).toEqual([]);
  });

  it.each([
    ["an object", "{}"],
    ["a number", "5"],
    ["null", "null"],
    ["a string", '"abc"'],
    ["a mixed array", '["a", 2]'],
  ])("returns an empty array for %s", (_label, stored) => {
    localStorage.setItem(KEY, stored);

    expect(getSavedOrder(KEY)).toEqual([]);
  });

  it("returns an empty array when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(getSavedOrder(KEY)).toEqual([]);
  });
});

describe("saveOrder", () => {
  it("persists ids so they can be read back", () => {
    saveOrder(KEY, ["a", "b"]);

    expect(getSavedOrder(KEY)).toEqual(["a", "b"]);
  });

  it("does not throw when storage is unavailable or full", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveOrder(KEY, ["a"])).not.toThrow();
  });
});

describe("applyStoredOrder", () => {
  const getId = (item: TItem) => item.id;

  it("returns items untouched when no order is stored", () => {
    const result = applyStoredOrder(items(["a", "b", "c"]), getId, KEY);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("reorders items to match the stored order", () => {
    saveOrder(KEY, ["c", "a", "b"]);

    const result = applyStoredOrder(items(["a", "b", "c"]), getId, KEY);

    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  it("skips stored ids that no longer exist", () => {
    saveOrder(KEY, ["c", "gone", "a"]);

    const result = applyStoredOrder(items(["a", "c"]), getId, KEY);

    expect(ids(result)).toEqual(["c", "a"]);
  });

  it("appends items missing from the stored order, keeping their order", () => {
    saveOrder(KEY, ["c"]);

    const result = applyStoredOrder(items(["a", "b", "c"]), getId, KEY);

    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  it("falls back to the incoming order for a bad stored value", () => {
    localStorage.setItem(KEY, '"abc"');

    const result = applyStoredOrder(items(["a", "b"]), getId, KEY);

    expect(ids(result)).toEqual(["a", "b"]);
  });

  it("does not mutate the input array", () => {
    saveOrder(KEY, ["b", "a"]);
    const input = items(["a", "b"]);
    applyStoredOrder(input, getId, KEY);

    expect(ids(input)).toEqual(["a", "b"]);
  });
});

describe("reorderByIds", () => {
  const getId = (item: TItem) => item.id;

  it("moves the active item to the position of the item it was dropped on", () => {
    const result = reorderByIds(items(["a", "b", "c"]), getId, "a", "c", KEY);

    expect(ids(result)).toEqual(["b", "c", "a"]);
  });

  it("moves an item backwards as well as forwards", () => {
    const result = reorderByIds(items(["a", "b", "c"]), getId, "c", "a", KEY);

    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  it("persists the new order so it survives a refetch", () => {
    const source = items(["a", "b", "c"]);
    reorderByIds(source, getId, "a", "c", KEY);

    expect(getSavedOrder(KEY)).toEqual(["b", "c", "a"]);
    expect(ids(applyStoredOrder(source, getId, KEY))).toEqual(["b", "c", "a"]);
  });

  it("returns the original array when the active id is unknown", () => {
    const source = items(["a", "b"]);
    const result = reorderByIds(source, getId, "gone", "a", KEY);

    expect(result).toBe(source);
  });

  it("returns the original array when the target id is unknown", () => {
    const source = items(["a", "b"]);
    const result = reorderByIds(source, getId, "a", "gone", KEY);

    expect(result).toBe(source);
  });

  it("persists nothing when the reorder is a no-op", () => {
    reorderByIds(items(["a", "b"]), getId, "a", "gone", KEY);

    expect(getSavedOrder(KEY)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const source = items(["a", "b", "c"]);
    reorderByIds(source, getId, "a", "c", KEY);

    expect(ids(source)).toEqual(["a", "b", "c"]);
  });

  it("does not throw when persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const result = reorderByIds(items(["a", "b"]), getId, "a", "b", KEY);

    expect(ids(result)).toEqual(["b", "a"]);
  });
});
