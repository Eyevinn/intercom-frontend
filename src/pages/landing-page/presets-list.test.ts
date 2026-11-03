import { describe, it, expect } from "vitest";

/**
 * Regression tests for the preset Join button's program-line splitting logic.
 *
 * These tests validate the program-line splitting logic used in calls-page.tsx.
 * When joining a preset URL, calls-page.tsx fetches each production via the API
 * and checks the real programOutputLine flag to split refs into program-feed
 * join cards vs. auto-joined lines.
 *
 * The splitting function is tested here in isolation as a pure function since
 * the logic is deterministic and independent of React rendering.
 */

type PresetCall = {
  productionId: string;
  lineId: string;
  lineUsedForProgramOutput?: boolean;
  lineName?: string;
};

type FetchedLine = {
  id: string;
  name?: string;
  programOutputLine?: boolean;
};

/**
 * Pure extraction of the splitting logic from handleJoin — mirrors the
 * implementation in presets-list.tsx so that a regression is caught here first.
 */
function splitCallsByProgramOutput(
  calls: PresetCall[],
  linesByProduction: Map<string, FetchedLine[]>
): { programCalls: PresetCall[]; normalCalls: PresetCall[] } {
  const programCalls = calls.filter((c) => {
    const lines = linesByProduction.get(c.productionId);
    if (!lines) return false;
    const line = lines.find((l) => String(l.id) === String(c.lineId));
    return line?.programOutputLine === true;
  });
  const normalCalls = calls.filter((c) => {
    const lines = linesByProduction.get(c.productionId);
    if (!lines) return false;
    const line = lines.find((l) => String(l.id) === String(c.lineId));
    return line?.programOutputLine !== true;
  });
  return { programCalls, normalCalls };
}

describe("preset join — program-line splitting", () => {
  it("places a line with programOutputLine=true into programCalls even when call.lineUsedForProgramOutput is false", () => {
    // This is the exact bug scenario: the preset stored lineUsedForProgramOutput=false
    // because it was saved via auto-join, but the real line IS a program output line.
    const calls: PresetCall[] = [
      {
        productionId: "prod1",
        lineId: "line-pgm",
        lineUsedForProgramOutput: false,
      },
      {
        productionId: "prod1",
        lineId: "line-normal",
        lineUsedForProgramOutput: false,
      },
    ];

    const linesByProduction = new Map<string, FetchedLine[]>([
      [
        "prod1",
        [
          { id: "line-pgm", name: "PGM", programOutputLine: true },
          { id: "line-normal", name: "IFB", programOutputLine: false },
        ],
      ],
    ]);

    const { programCalls, normalCalls } = splitCallsByProgramOutput(
      calls,
      linesByProduction
    );

    expect(programCalls).toHaveLength(1);
    expect(programCalls[0].lineId).toBe("line-pgm");
    expect(normalCalls).toHaveLength(1);
    expect(normalCalls[0].lineId).toBe("line-normal");
  });

  it("places all calls in normalCalls when no line has programOutputLine=true", () => {
    const calls: PresetCall[] = [
      { productionId: "prod1", lineId: "line-a" },
      { productionId: "prod1", lineId: "line-b" },
    ];

    const linesByProduction = new Map<string, FetchedLine[]>([
      [
        "prod1",
        [
          { id: "line-a", name: "A", programOutputLine: false },
          { id: "line-b", name: "B" },
        ],
      ],
    ]);

    const { programCalls, normalCalls } = splitCallsByProgramOutput(
      calls,
      linesByProduction
    );

    expect(programCalls).toHaveLength(0);
    expect(normalCalls).toHaveLength(2);
  });

  it("treats calls whose line is not found in the API response as normal calls", () => {
    const calls: PresetCall[] = [
      { productionId: "prod1", lineId: "line-missing" },
    ];

    const linesByProduction = new Map<string, FetchedLine[]>([
      ["prod1", [{ id: "line-other", name: "Other" }]],
    ]);

    const { programCalls, normalCalls } = splitCallsByProgramOutput(
      calls,
      linesByProduction
    );

    expect(programCalls).toHaveLength(0);
    expect(normalCalls).toHaveLength(1);
  });

  it("correctly splits when line id is a number in the API response but a string in the preset call (type coercion)", () => {
    // Bug: the backend may return TLine.id as a number in JSON even though the
    // TypeScript type declares it as string. Strict === between a number and a
    // string always returns false, so the line was never found and programOutputLine
    // was never detected. Fix: use String(l.id) === String(c.lineId).
    const calls: PresetCall[] = [{ productionId: "prod1", lineId: "42" }];

    // Simulate the API returning id as a number (cast to any to bypass the type)
    const linesByProduction = new Map<string, FetchedLine[]>([
      [
        "prod1",
        [{ id: 42 as unknown as string, name: "PGM", programOutputLine: true }],
      ],
    ]);

    // The split function must find the line even with the numeric/string mismatch
    const { programCalls, normalCalls } = splitCallsByProgramOutput(
      calls,
      linesByProduction
    );

    expect(programCalls).toHaveLength(1);
    expect(programCalls[0].lineId).toBe("42");
    expect(normalCalls).toHaveLength(0);
  });

  it("correctly splits calls across multiple productions", () => {
    const calls: PresetCall[] = [
      { productionId: "prod1", lineId: "line-pgm" },
      { productionId: "prod2", lineId: "line-normal" },
    ];

    const linesByProduction = new Map<string, FetchedLine[]>([
      ["prod1", [{ id: "line-pgm", name: "PGM", programOutputLine: true }]],
      ["prod2", [{ id: "line-normal", name: "IFB", programOutputLine: false }]],
    ]);

    const { programCalls, normalCalls } = splitCallsByProgramOutput(
      calls,
      linesByProduction
    );

    expect(programCalls).toHaveLength(1);
    expect(programCalls[0]).toMatchObject({
      productionId: "prod1",
      lineId: "line-pgm",
    });
    expect(normalCalls).toHaveLength(1);
    expect(normalCalls[0]).toMatchObject({
      productionId: "prod2",
      lineId: "line-normal",
    });
  });

  it("excludes a call entirely when its production is not in the API response (deleted production)", () => {
    const calls: PresetCall[] = [
      { productionId: "prod-deleted", lineId: "line-1" },
      { productionId: "prod-existing", lineId: "line-2" },
    ];

    // prod-deleted was not returned by the API (production was deleted)
    const linesByProduction = new Map<string, FetchedLine[]>([
      [
        "prod-existing",
        [{ id: "line-2", name: "IFB", programOutputLine: false }],
      ],
    ]);

    const { programCalls, normalCalls } = splitCallsByProgramOutput(
      calls,
      linesByProduction
    );

    // The deleted production's call should appear in neither bucket
    expect(programCalls).toHaveLength(0);
    expect(normalCalls).toHaveLength(1);
    expect(normalCalls[0]).toMatchObject({ productionId: "prod-existing" });
  });
});
