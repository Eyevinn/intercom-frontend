import { describe, it, expect } from "vitest";
import {
  buildCallsUrl,
  encodeCallsParam,
  decodeCallsParam,
  parseCompanionParam,
} from "./call-url";

describe("buildCallsUrl", () => {
  it("returns /lines when given an empty list", () => {
    expect(buildCallsUrl([])).toBe("/lines");
  });

  it("produces the /lines?lines=prodId:lineId format for a single call", () => {
    // Regression: use-navigate-to-production previously navigated to the old
    // /production-calls/production/:id/line/:id URL. This assertion locks in
    // the correct target URL that buildCallsUrl must produce so that the landing
    // page join lands directly on the right route without a flash redirect.
    expect(buildCallsUrl([{ productionId: "prod-1", lineId: "line-2" }])).toBe(
      "/lines?lines=prod-1:line-2"
    );
  });

  it("encodes multiple calls as a comma-separated list", () => {
    expect(
      buildCallsUrl([
        { productionId: "p1", lineId: "l1" },
        { productionId: "p2", lineId: "l2" },
      ])
    ).toBe("/lines?lines=p1:l1,p2:l2");
  });
});

describe("decodeCallsParam", () => {
  it("returns an empty array for null", () => {
    expect(decodeCallsParam(null)).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(decodeCallsParam("")).toEqual([]);
  });

  it("decodes a single call ref", () => {
    expect(decodeCallsParam("prod-1:line-2")).toEqual([
      { productionId: "prod-1", lineId: "line-2" },
    ]);
  });

  it("decodes multiple call refs", () => {
    expect(decodeCallsParam("p1:l1,p2:l2")).toEqual([
      { productionId: "p1", lineId: "l1" },
      { productionId: "p2", lineId: "l2" },
    ]);
  });

  it("drops malformed entries (missing colon)", () => {
    expect(decodeCallsParam("p1:l1,badentry,p2:l2")).toEqual([
      { productionId: "p1", lineId: "l1" },
      { productionId: "p2", lineId: "l2" },
    ]);
  });
});

describe("encodeCallsParam", () => {
  it("encodes call refs as colon-separated pairs joined by commas", () => {
    expect(
      encodeCallsParam([
        { productionId: "a", lineId: "b" },
        { productionId: "c", lineId: "d" },
      ])
    ).toBe("a:b,c:d");
  });
});

describe("buildCallsUrl round-trip", () => {
  it("buildCallsUrl → decodeCallsParam round-trips correctly", () => {
    // Regression: the URL sync guard in use-calls-navigation compares
    // buildCallsUrl(currentCallRefs) against window.location.pathname +
    // window.location.search. This test confirms the encoded form can be
    // decoded back to the original refs without loss.
    const refs = [
      { productionId: "prod-42", lineId: "line-7" },
      { productionId: "prod-99", lineId: "line-3" },
    ];
    const url = buildCallsUrl(refs);
    const searchParam = new URLSearchParams(url.split("?")[1]).get("lines");
    expect(decodeCallsParam(searchParam)).toEqual(refs);
  });
});

describe("buildCallsUrl — companion URL", () => {
  it("appends companion param by stripping the ws:// prefix", () => {
    const url = buildCallsUrl(
      [{ productionId: "p1", lineId: "l1" }],
      "ws://localhost:12345"
    );
    expect(url).toBe("/lines?lines=p1:l1&companion=localhost:12345");
  });

  it("strips wss:// prefix from companion URL", () => {
    const url = buildCallsUrl(
      [{ productionId: "p1", lineId: "l1" }],
      "wss://example.com:9000"
    );
    expect(url).toBe("/lines?lines=p1:l1&companion=example.com:9000");
  });

  it("works with empty calls list and a companion URL", () => {
    const url = buildCallsUrl([], "ws://localhost:12345");
    expect(url).toBe("/lines?companion=localhost:12345");
  });

  it("returns the base URL unchanged when companionUrl is undefined", () => {
    expect(buildCallsUrl([{ productionId: "p1", lineId: "l1" }])).toBe(
      "/lines?lines=p1:l1"
    );
  });
});

describe("parseCompanionParam", () => {
  it("returns undefined for null input", () => {
    expect(parseCompanionParam(null)).toBeUndefined();
  });

  it("wraps host:port in ws://", () => {
    expect(parseCompanionParam("localhost:12345")).toBe("ws://localhost:12345");
  });

  it("wraps a bare hostname in ws://", () => {
    expect(parseCompanionParam("example.com")).toBe("ws://example.com");
  });
});
