import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOrderedList } from "./use-ordered-list";
import { saveOrder } from "../utils/list-order";

const KEY = "test-ordered-list";

type TItem = { id: string; name: string };

const items = (names: string[]): TItem[] =>
  names.map((name) => ({ id: name.toLowerCase(), name }));
const names = (list: TItem[]) => list.map((i) => i.name);
const getId = (item: TItem) => item.id;

const render = (initial: TItem[]) =>
  renderHook(({ list }) => useOrderedList(list, getId, KEY), {
    initialProps: { list: initial },
  });

afterEach(() => {
  localStorage.clear();
});

describe("useOrderedList", () => {
  it("sorts alphabetically when no order is stored", () => {
    const { result } = render(items(["Charlie", "alpha", "Bravo"]));

    expect(names(result.current.ordered)).toEqual([
      "alpha",
      "Bravo",
      "Charlie",
    ]);
  });

  it("applies a stored order over the alphabetical default", () => {
    saveOrder(KEY, ["charlie", "alpha", "bravo"]);

    const { result } = render(items(["alpha", "Bravo", "Charlie"]));

    expect(names(result.current.ordered)).toEqual([
      "Charlie",
      "alpha",
      "Bravo",
    ]);
  });

  it("returns an empty list for no items", () => {
    const { result } = render([]);

    expect(result.current.ordered).toEqual([]);
  });

  it("reorders and persists on drag end", () => {
    const { result } = render(items(["Alpha", "Bravo", "Charlie"]));

    act(() => {
      result.current.reorder("alpha", "charlie");
    });

    expect(names(result.current.ordered)).toEqual([
      "Bravo",
      "Charlie",
      "Alpha",
    ]);
    expect(localStorage.getItem(KEY)).toBe(
      JSON.stringify(["bravo", "charlie", "alpha"])
    );
  });

  it("keeps a custom order when the polled list is refetched", () => {
    const first = items(["Alpha", "Bravo", "Charlie"]);
    const { result, rerender } = render(first);

    act(() => {
      result.current.reorder("alpha", "charlie");
    });

    rerender({ list: items(["Alpha", "Bravo", "Charlie"]) });

    expect(names(result.current.ordered)).toEqual([
      "Bravo",
      "Charlie",
      "Alpha",
    ]);
  });

  it("appends newly added items after the custom order", () => {
    const { result, rerender } = render(items(["Alpha", "Bravo"]));

    act(() => {
      result.current.reorder("alpha", "bravo");
    });

    rerender({ list: items(["Alpha", "Bravo", "Delta"]) });

    expect(names(result.current.ordered)).toEqual(["Bravo", "Alpha", "Delta"]);
  });

  it("drops removed items on refetch without disturbing the rest", () => {
    const { result, rerender } = render(items(["Alpha", "Bravo", "Charlie"]));

    act(() => {
      result.current.reorder("charlie", "alpha");
    });

    rerender({ list: items(["Alpha", "Charlie"]) });

    expect(names(result.current.ordered)).toEqual(["Charlie", "Alpha"]);
  });

  it("ignores a reorder referencing an unknown id", () => {
    const { result } = render(items(["Alpha", "Bravo"]));

    act(() => {
      result.current.reorder("alpha", "gone");
    });

    expect(names(result.current.ordered)).toEqual(["Alpha", "Bravo"]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
