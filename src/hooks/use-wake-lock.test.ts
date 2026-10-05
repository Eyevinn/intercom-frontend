import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWakeLock } from "./use-wake-lock.ts";

type MockSentinel = { released: boolean; release: ReturnType<typeof vi.fn> };

const createSentinel = (): MockSentinel => {
  const sentinel: MockSentinel = {
    released: false,
    release: vi.fn(() => {
      sentinel.released = true;
      return Promise.resolve();
    }),
  };
  return sentinel;
};

describe("useWakeLock", () => {
  let sentinels: MockSentinel[];
  let request: ReturnType<typeof vi.fn>;
  let visibilityState: DocumentVisibilityState;

  beforeEach(() => {
    sentinels = [];
    request = vi.fn(() => {
      const s = createSentinel();
      sentinels.push(s);
      return Promise.resolve(s);
    });
    Object.defineProperty(navigator, "wakeLock", {
      value: { request },
      configurable: true,
    });
    visibilityState = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibilityState
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).wakeLock;
  });

  it("does not request a wake lock when disabled", () => {
    renderHook(() => useWakeLock(false));
    expect(request).not.toHaveBeenCalled();
  });

  it("requests a screen wake lock when enabled", async () => {
    renderHook(() => useWakeLock(true));
    await waitFor(() => expect(request).toHaveBeenCalledWith("screen"));
  });

  it("releases the wake lock when disabled", async () => {
    const { rerender } = renderHook(({ enabled }) => useWakeLock(enabled), {
      initialProps: { enabled: true },
    });
    await waitFor(() => expect(sentinels).toHaveLength(1));

    rerender({ enabled: false });
    expect(sentinels[0].release).toHaveBeenCalled();
  });

  it("re-acquires the wake lock when the page becomes visible again", async () => {
    renderHook(() => useWakeLock(true));
    await waitFor(() => expect(sentinels).toHaveLength(1));

    // Browser releases the lock when the page is hidden
    sentinels[0].released = true;
    visibilityState = "hidden";
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(request).toHaveBeenCalledTimes(1);

    visibilityState = "visible";
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("does nothing when the Wake Lock API is unsupported", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).wakeLock;
    expect(() => renderHook(() => useWakeLock(true))).not.toThrow();
  });
});
