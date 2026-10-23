import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVideoTileGrid } from "./use-video-tile-grid.ts";
import { createVideoElement } from "./video-element-factory.ts";
import { TParticipant } from "./types.ts";

const SELF = "self-session";

const participant = (
  overrides: Partial<TParticipant> & { sessionId: string }
): TParticipant => ({
  name: `user-${overrides.sessionId}`,
  endpointId: `ep-${overrides.sessionId}`,
  isActive: true,
  isWhip: false,
  isWhepReceiver: false,
  hasVideo: true,
  ...overrides,
});

type FakeTrack = { muted: boolean; readyState: string };

const makeStream = (id: string): { stream: MediaStream; track: FakeTrack } => {
  const track = {
    kind: "video",
    id: `${id}-track`,
    readyState: "live",
    muted: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const stream = Object.create(MediaStream.prototype);
  Object.assign(stream, {
    id,
    getTracks: () => [track],
    getVideoTracks: () => [track],
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  return { stream: stream as MediaStream, track };
};

const makeTile = (endpointId: string) => {
  const { stream, track } = makeStream(endpointId);
  const el = createVideoElement({ stream, lineId: "1", endpointId });
  Object.defineProperty(el, "videoWidth", { value: 640, configurable: true });
  Object.defineProperty(el, "videoHeight", { value: 360, configurable: true });
  return { el, track };
};

const tick = (ms = 600) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const isVisible = (el: HTMLVideoElement) =>
  (el.parentElement as HTMLElement).style.display !== "none";

const match = (sessionId: string | null, name: string | null) => ({
  name,
  isWhip: false,
  sessionId,
});

const UNMATCHED = match(null, null);

type HookProps = Parameters<typeof useVideoTileGrid>[0];

const baseProps = (over: Partial<HookProps>): HookProps => ({
  videoElements: [],
  participants: [],
  tileMatches: [],
  pinnedContainer: null,
  pinnedSessionId: null,
  selfSessionId: SELF,
  cameraStream: null,
  cameraLabel: null,
  pendingPinPromiseRef: { current: null },
  onAutoUnpin: () => {},
  ...over,
});

const renderGrid = (grid: HTMLDivElement, over: Partial<HookProps>) => {
  const view = renderHook((p: HookProps) => useVideoTileGrid(p), {
    initialProps: baseProps(over),
  });
  act(() => {
    view.result.current.setVideoGridEl(grid);
  });
  return {
    ...view,
    update: (next: Partial<HookProps>) => view.rerender(baseProps(next)),
  };
};

describe("useVideoTileGrid — remote tile lifecycle", () => {
  let grid: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    grid = document.createElement("div");
    document.body.appendChild(grid);
  });

  afterEach(() => {
    vi.useRealTimers();
    grid.remove();
  });

  it("shows a tile while its publisher is in the call", () => {
    const { el } = makeTile("ep-a");
    const a = participant({ sessionId: "a", endpointId: "ep-a" });

    renderGrid(grid, {
      videoElements: [el],
      participants: [a],
      tileMatches: [match("a", a.name)],
    });
    tick();

    expect(isVisible(el)).toBe(true);
    expect(grid.contains(el.parentElement)).toBe(true);
  });

  it("hides the frozen tile when the last publisher leaves, without destroying it", () => {
    const { el } = makeTile("ep-a");
    const a = participant({ sessionId: "a", endpointId: "ep-a" });

    const view = renderGrid(grid, {
      videoElements: [el],
      participants: [a],
      tileMatches: [match("a", a.name)],
    });
    tick();
    expect(isVisible(el)).toBe(true);

    view.update({
      videoElements: [el],
      participants: [],
      tileMatches: [UNMATCHED],
    });

    expect(isVisible(el)).toBe(false);
    expect(grid.contains(el.parentElement)).toBe(true);
    expect(el.srcObject).not.toBeNull();
    expect(el.paused).toBe(false);
  });

  it("keeps the tile hidden when the frozen element fires media events", () => {
    const { el } = makeTile("ep-a");
    const a = participant({ sessionId: "a", endpointId: "ep-a" });

    const view = renderGrid(grid, {
      videoElements: [el],
      participants: [a],
      tileMatches: [match("a", a.name)],
    });
    tick();

    view.update({
      videoElements: [el],
      participants: [],
      tileMatches: [UNMATCHED],
    });
    expect(isVisible(el)).toBe(false);

    ["canplay", "playing", "resize", "loadedmetadata"].forEach((name) => {
      act(() => {
        el.dispatchEvent(new Event(name));
      });
      expect(isVisible(el)).toBe(false);
    });
    tick(3000);

    expect(isVisible(el)).toBe(false);
  });

  it("brings the tile back when a new publisher takes over the slot", () => {
    const { el } = makeTile("ep-a");
    const a = participant({ sessionId: "a", endpointId: "ep-a" });

    const view = renderGrid(grid, {
      videoElements: [el],
      participants: [a],
      tileMatches: [match("a", a.name)],
    });
    tick();

    view.update({
      videoElements: [el],
      participants: [],
      tileMatches: [UNMATCHED],
    });
    expect(isVisible(el)).toBe(false);

    const b = participant({ sessionId: "b", endpointId: "ep-b" });
    view.update({
      videoElements: [el],
      participants: [b],
      tileMatches: [UNMATCHED],
    });

    expect(isVisible(el)).toBe(true);
  });

  it("hides a tile whose publisher is still listed but has stopped sending", () => {
    const { el, track } = makeTile("ep-a");
    const a = participant({ sessionId: "a", endpointId: "ep-a" });

    renderGrid(grid, {
      videoElements: [el],
      participants: [a],
      tileMatches: [match("a", a.name)],
    });
    tick();
    expect(isVisible(el)).toBe(true);

    track.muted = true;
    tick();

    expect(isVisible(el)).toBe(false);
  });

  it("leaves the surviving tile alone when one of two publishers leaves", () => {
    const { el: elA } = makeTile("ep-a");
    const { el: elB } = makeTile("ep-b");
    const a = participant({ sessionId: "a", endpointId: "ep-a" });
    const b = participant({ sessionId: "b", endpointId: "ep-b" });

    const view = renderGrid(grid, {
      videoElements: [elA, elB],
      participants: [a, b],
      tileMatches: [match("a", a.name), match("b", b.name)],
    });
    tick();

    view.update({
      videoElements: [elA, elB],
      participants: [b],
      tileMatches: [UNMATCHED, match("b", b.name)],
    });
    tick();

    expect(isVisible(elB)).toBe(true);
    expect(isVisible(elA)).toBe(false);
  });
});
