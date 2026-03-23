import { describe, it, expect } from "vitest";
import { buildCallsUrl, encodeCallsParam, decodeCallsParam } from "./call-url";

describe("buildCallsUrl", () => {
  it("returns /calls when given an empty list", () => {
    expect(buildCallsUrl([])).toBe("/calls");
  });

  it("produces the /calls?calls=prodId:lineId format for a single call", () => {
    // Regression: use-navigate-to-production previously navigated to the old
    // /production-calls/production/:id/line/:id URL. This assertion locks in
    // the correct target URL that buildCallsUrl must produce so that the landing
    // page join lands directly on the right route without a flash redirect.
    expect(buildCallsUrl([{ productionId: "prod-1", lineId: "line-2" }])).toBe(
      "/calls?calls=prod-1:line-2"
    );
  });

  it("encodes multiple calls as a comma-separated list", () => {
    expect(
      buildCallsUrl([
        { productionId: "p1", lineId: "l1" },
        { productionId: "p2", lineId: "l2" },
      ])
    ).toBe("/calls?calls=p1:l1,p2:l2");
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
    const searchParam = new URLSearchParams(url.split("?")[1]).get("calls");
    expect(decodeCallsParam(searchParam)).toEqual(refs);
  });
});
