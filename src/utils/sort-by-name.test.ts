import { describe, expect, it } from "vitest";
import { sortByName } from "./sort-by-name";

const names = (items: { name: string }[]) => items.map((i) => i.name);

describe("sortByName", () => {
  it("orders alphabetically regardless of case", () => {
    const sorted = sortByName([
      { name: "evening news" },
      { name: "Alpha" },
      { name: "Morning Show" },
      { name: "beta" },
    ]);

    expect(names(sorted)).toEqual([
      "Alpha",
      "beta",
      "evening news",
      "Morning Show",
    ]);
  });

  it("orders embedded numbers by value, not by digit", () => {
    const sorted = sortByName([
      { name: "Studio 10" },
      { name: "Studio 2" },
      { name: "Studio 1" },
    ]);

    expect(names(sorted)).toEqual(["Studio 1", "Studio 2", "Studio 10"]);
  });

  it("does not mutate the input array", () => {
    const input = [{ name: "B" }, { name: "A" }];
    sortByName(input);

    expect(names(input)).toEqual(["B", "A"]);
  });
});
