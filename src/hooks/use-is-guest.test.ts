import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsGuest } from "./use-is-guest";
import { guestSession } from "../utils/guest-session";

beforeEach(() => {
  sessionStorage.clear();
});

describe("useIsGuest", () => {
  it("is false when no guest session was started", () => {
    const { result } = renderHook(() => useIsGuest());

    expect(result.current).toBe(false);
  });

  it("is true once a guest session exists", () => {
    guestSession.start("/calls?lines=p:l&guest=1");

    const { result } = renderHook(() => useIsGuest());

    expect(result.current).toBe(true);
  });
});
