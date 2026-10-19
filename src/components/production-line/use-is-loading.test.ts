import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsLoading } from "./use-is-loading.ts";

type TState = string | null;

const setup = (initial: TState = null) =>
  renderHook(
    ({ connectionState }: { connectionState: TState }) =>
      useIsLoading({ connectionState }),
    { initialProps: { connectionState: initial } }
  );

describe("useIsLoading", () => {
  it("starts loading with no error", () => {
    const { result } = setup();
    expect(result.current.loading).toBe(true);
    expect(result.current.connectionError).toBe(false);
  });

  it("stops loading once connected", () => {
    const { result, rerender } = setup();
    rerender({ connectionState: "connected" });
    expect(result.current.loading).toBe(false);
    expect(result.current.connectionError).toBe(false);
  });

  it("flags a connection error when the peer connection fails", () => {
    const { result, rerender } = setup();
    rerender({ connectionState: "failed" });
    expect(result.current.connectionError).toBe(true);
  });

  it("clears the error after a successful rejoin so the call UI returns", () => {
    const { result, rerender } = setup();
    // Connect, then the peer connection fails.
    rerender({ connectionState: "connected" });
    rerender({ connectionState: "failed" });
    expect(result.current.connectionError).toBe(true);

    // Auto-rejoin: the connection resets and then connects again.
    rerender({ connectionState: null });
    expect(result.current.connectionError).toBe(false);
    rerender({ connectionState: "connected" });
    expect(result.current.connectionError).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("clears the error when the connection resets to null for a rejoin", () => {
    const { result, rerender } = setup();
    rerender({ connectionState: "failed" });
    expect(result.current.connectionError).toBe(true);
    rerender({ connectionState: null });
    expect(result.current.connectionError).toBe(false);
  });
});
