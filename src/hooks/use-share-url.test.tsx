import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useShareUrl } from "./use-share-url";

const mockShareLine = vi.fn();
vi.mock("../components/production-line/use-share-line", () => ({
  useShareLine: () => mockShareLine,
}));

beforeEach(() => {
  mockShareLine.mockReset();
  mockShareLine.mockResolvedValue({ url: "https://example.test/shared" });
});

describe("useShareUrl", () => {
  it("shares an unrestricted calls path by default", async () => {
    const { result } = renderHook(() => useShareUrl());

    await act(async () => {
      await result.current.shareUrl({ productionId: "p1", lineId: "l1" });
    });

    expect(mockShareLine).toHaveBeenCalledWith({ path: "/calls?lines=p1:l1" });
  });

  it("adds the guest marker when the link is restricted", async () => {
    const { result } = renderHook(() => useShareUrl());

    await act(async () => {
      await result.current.shareUrl({
        productionId: "p1",
        lineId: "l1",
        guest: true,
      });
    });

    expect(mockShareLine).toHaveBeenCalledWith({
      path: "/calls?lines=p1:l1&guest=1",
    });
  });

  it("returns an empty string when sharing fails", async () => {
    mockShareLine.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useShareUrl());

    let returned: string | undefined;
    await act(async () => {
      returned = await result.current.shareUrl({
        productionId: "p1",
        lineId: "l1",
      });
    });

    expect(returned).toBe("");
  });
});
