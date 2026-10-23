import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { TParticipant } from "./types.ts";
import { LabelResult } from "./match-video-tile-labels.ts";

const setTilePinTransitioning = vi.fn();
const setTilePipStream = vi.fn();
const setTilePipLabel = vi.fn();
const updateVideoTileLabel = vi.fn();
const updateVideoTileContainerPinned = vi.fn();
const setTileParticipantBacked = vi.fn();

vi.mock("./video-element-factory.ts", () => ({
  setTilePinTransitioning: (tile: HTMLElement, on: boolean) =>
    setTilePinTransitioning(tile, on),
  setTilePipStream: (tile: HTMLElement, stream: MediaStream | null) =>
    setTilePipStream(tile, stream),
  setTilePipLabel: (tile: HTMLElement, label: string | null) =>
    setTilePipLabel(tile, label),
  updateVideoTileLabel: (
    el: HTMLVideoElement,
    name: string | null,
    isWhip: boolean
  ) => updateVideoTileLabel(el, name, isWhip),
  updateVideoTileContainerPinned: (tile: HTMLElement, isPinned: boolean) =>
    updateVideoTileContainerPinned(tile, isPinned),
  setTileParticipantBacked: (el: HTMLVideoElement, backed: boolean) =>
    setTileParticipantBacked(el, backed),
}));

// eslint-disable-next-line import/first
import { useVideoTileGrid } from "./use-video-tile-grid.ts";

type Tile = { tile: HTMLDivElement; video: HTMLVideoElement };

const makeTile = (id: string): Tile => {
  const tile = document.createElement("div");
  tile.dataset.testid = id;
  const video = document.createElement("video");
  tile.appendChild(video);
  return { tile, video };
};

const makeParticipant = (
  overrides: Partial<TParticipant> = {}
): TParticipant => ({
  name: "Alice",
  sessionId: "s1",
  endpointId: "e1",
  isActive: true,
  isWhip: false,
  hasVideo: true,
  ...overrides,
});

const match = (
  sessionId: string | null,
  name: string | null = null,
  isWhip = false
): LabelResult => ({ sessionId, name, isWhip });

const makeTrack = (readyState: MediaStreamTrackState) =>
  ({
    id: `t-${Math.random()}`,
    kind: "video",
    readyState,
  }) as unknown as MediaStreamTrack;

type Props = Parameters<typeof useVideoTileGrid>[0];

const baseProps = (overrides: Partial<Props> = {}): Props => ({
  videoElements: [],
  participants: [],
  tileMatches: [],
  pinnedContainer: null,
  pinnedSessionId: null,
  selfSessionId: null,
  cameraStream: null,
  cameraLabel: null,
  pendingPinPromiseRef: {
    current: null,
  } as MutableRefObject<Promise<void> | null>,
  onAutoUnpin: vi.fn(),
  ...overrides,
});

const renderGrid = (initial: Props) => {
  const grid = document.createElement("div");
  const hook = renderHook((props: Props) => useVideoTileGrid(props), {
    initialProps: initial,
  });
  act(() => {
    hook.result.current.setVideoGridEl(grid);
  });
  return { ...hook, grid };
};

const childIds = (grid: HTMLElement) =>
  Array.from(grid.children).map((c) => (c as HTMLElement).dataset.testid);

describe("useVideoTileGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("grid reconciliation", () => {
    it("does not touch any grid until setVideoGridEl is called", () => {
      const a = makeTile("a");
      const { result } = renderHook(() =>
        useVideoTileGrid(baseProps({ videoElements: [a.video] }))
      );
      expect(typeof result.current.setVideoGridEl).toBe("function");
      expect(a.tile.parentElement).toBeNull();
      expect(updateVideoTileLabel).not.toHaveBeenCalled();
    });

    it("tolerates videoElements being null", () => {
      const { grid } = renderGrid(baseProps({ videoElements: null }));
      expect(grid.children).toHaveLength(0);
    });

    it("appends each video's parent tile to the grid in order", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const c = makeTile("c");
      const { grid } = renderGrid(
        baseProps({ videoElements: [a.video, b.video, c.video] })
      );
      expect(childIds(grid)).toEqual(["a", "b", "c"]);
    });

    it("falls back to the bare video element when it has no parent", () => {
      const video = document.createElement("video");
      const { grid } = renderGrid(baseProps({ videoElements: [video] }));
      expect(grid.firstChild).toBe(video);
    });

    it("removes grid children that are no longer backed by a video element", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const { grid, rerender } = renderGrid(
        baseProps({ videoElements: [a.video, b.video] })
      );
      const stray = document.createElement("div");
      stray.dataset.testid = "stray";
      grid.appendChild(stray);

      rerender(baseProps({ videoElements: [b.video] }));

      expect(childIds(grid)).toEqual(["b"]);
    });

    it("reorders existing tiles to match the new videoElements order", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const c = makeTile("c");
      const { grid, rerender } = renderGrid(
        baseProps({ videoElements: [a.video, b.video, c.video] })
      );

      rerender(baseProps({ videoElements: [c.video, a.video, b.video] }));

      expect(childIds(grid)).toEqual(["c", "a", "b"]);
    });

    it("does not move tiles that are already in the right slot", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const { grid, rerender } = renderGrid(
        baseProps({ videoElements: [a.video, b.video] })
      );
      const insertSpy = vi.spyOn(grid, "insertBefore");

      rerender(baseProps({ videoElements: [a.video, b.video] }));

      expect(insertSpy).not.toHaveBeenCalled();
      expect(childIds(grid)).toEqual(["a", "b"]);
    });
  });

  describe("pinning", () => {
    it("moves the pinned container to the front of the grid", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const c = makeTile("c");
      const { grid } = renderGrid(
        baseProps({
          videoElements: [a.video, b.video, c.video],
          pinnedContainer: c.tile,
        })
      );
      expect(childIds(grid)).toEqual(["c", "a", "b"]);
    });

    it("marks only the pinned tile via updateVideoTileContainerPinned and style.order", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          pinnedContainer: b.tile,
        })
      );

      expect(updateVideoTileContainerPinned).toHaveBeenCalledWith(b.tile, true);
      expect(updateVideoTileContainerPinned).toHaveBeenCalledWith(
        a.tile,
        false
      );
      expect(b.tile.style.order).toBe("-1");
      expect(a.tile.style.order).toBe("0");
    });

    it("un-marks the previously pinned tile when the pin moves", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          pinnedContainer: a.tile,
        })
      );
      updateVideoTileContainerPinned.mockClear();

      rerender(
        baseProps({
          videoElements: [a.video, b.video],
          pinnedContainer: b.tile,
        })
      );

      expect(updateVideoTileContainerPinned).toHaveBeenCalledWith(
        a.tile,
        false
      );
      expect(updateVideoTileContainerPinned).toHaveBeenCalledWith(b.tile, true);
      expect(a.tile.style.order).toBe("0");
      expect(b.tile.style.order).toBe("-1");
    });

    it("calls onAutoUnpin when the pinned container is no longer among the tiles", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const onAutoUnpin = vi.fn();
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          pinnedContainer: b.tile,
          onAutoUnpin,
        })
      );
      expect(onAutoUnpin).not.toHaveBeenCalled();

      rerender(
        baseProps({
          videoElements: [a.video],
          pinnedContainer: b.tile,
          onAutoUnpin,
        })
      );
      expect(onAutoUnpin).toHaveBeenCalledTimes(1);
    });

    it("does not call onAutoUnpin when nothing is pinned", () => {
      const onAutoUnpin = vi.fn();
      renderGrid(baseProps({ videoElements: [], onAutoUnpin }));
      expect(onAutoUnpin).not.toHaveBeenCalled();
    });
  });

  describe("labels", () => {
    it("labels each tile from its tileMatches entry", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          tileMatches: [match(null, "Alice"), match(null, "Camera 1", true)],
          participants: [makeParticipant()],
        })
      );
      expect(updateVideoTileLabel).toHaveBeenCalledWith(
        a.video,
        "Alice",
        false
      );
      expect(updateVideoTileLabel).toHaveBeenCalledWith(
        b.video,
        "Camera 1",
        true
      );
    });

    it("clears the label when there is no match", () => {
      const a = makeTile("a");
      renderGrid(baseProps({ videoElements: [a.video], tileMatches: [] }));
      expect(updateVideoTileLabel).toHaveBeenCalledWith(a.video, null, false);
    });

    it("prefers the pinned participant's name and WHIP flag over the match", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [
            makeParticipant({ sessionId: "s1", name: "Alice" }),
            makeParticipant({ sessionId: "w1", name: "Feed", isWhip: true }),
          ],
          pinnedSessionId: "w1",
        })
      );
      expect(updateVideoTileLabel).toHaveBeenLastCalledWith(
        a.video,
        "Feed",
        true
      );
    });
  });

  describe("stale tile handling", () => {
    const backedCalls = (el: HTMLVideoElement) =>
      setTileParticipantBacked.mock.calls
        .filter(([v]) => v === el)
        .map(([, backed]) => backed);
    const lastBacked = (el: HTMLVideoElement) => backedCalls(el).at(-1);

    it("records the matched sessionId on the video element", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [makeParticipant({ sessionId: "s1" })],
        })
      );
      expect(a.video.dataset.lastSessionId).toBe("s1");
    });

    it("backs an untracked tile while some remote publisher is in the call", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match(null)],
          participants: [makeParticipant({ sessionId: "s1" })],
        })
      );
      expect(lastBacked(a.video)).toBe(true);
    });

    it("backs tiles whose participant is active with video", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [makeParticipant({ sessionId: "s1" })],
        })
      );
      expect(lastBacked(a.video)).toBe(true);
      expect(updateVideoTileLabel).toHaveBeenCalledWith(
        a.video,
        "Alice",
        false
      );
    });

    it("unbacks every tile once no remote publisher is left, keeping them in the grid", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const { grid } = renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          tileMatches: [match("s1", "Alice"), match(null)],
          participants: [],
        })
      );
      expect(lastBacked(a.video)).toBe(false);
      expect(lastBacked(b.video)).toBe(false);
      expect(childIds(grid)).toEqual(["a", "b"]);
    });

    it("ignores self and WHEP receivers when deciding if anyone publishes", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match(null)],
          selfSessionId: "self",
          participants: [
            makeParticipant({ sessionId: "self" }),
            makeParticipant({ sessionId: "r", isWhepReceiver: true }),
          ],
        })
      );
      expect(lastBacked(a.video)).toBe(false);
    });

    it("unbacks a tile whose participant is inactive, even if its track is still live", () => {
      const a = makeTile("a");
      a.video.srcObject = new MediaStream([makeTrack("live")]);
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [
            makeParticipant({ sessionId: "s1", isActive: false }),
            makeParticipant({ sessionId: "s2" }),
          ],
        })
      );
      expect(lastBacked(a.video)).toBe(false);
    });

    it("unbacks a tile whose participant is active but has stopped sending video", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [
            makeParticipant({ sessionId: "s1", hasVideo: false }),
            makeParticipant({ sessionId: "s2" }),
          ],
        })
      );
      expect(lastBacked(a.video)).toBe(false);
    });

    it("clears the label and lastSessionId of an unbacked tile", () => {
      const a = makeTile("a");
      renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [makeParticipant({ sessionId: "s2" })],
        })
      );
      expect(updateVideoTileLabel).toHaveBeenCalledWith(a.video, null, false);
      expect(updateVideoTileLabel).not.toHaveBeenCalledWith(
        a.video,
        "Alice",
        expect.anything()
      );
      expect(a.video.dataset.lastSessionId).toBe("");
    });

    it("falls back to dataset.lastSessionId once the match disappears", () => {
      const a = makeTile("a");
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [
            makeParticipant({ sessionId: "s1" }),
            makeParticipant({ sessionId: "s2" }),
          ],
        })
      );
      expect(lastBacked(a.video)).toBe(true);

      rerender(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match(null)],
          participants: [
            makeParticipant({ sessionId: "s1", isActive: false }),
            makeParticipant({ sessionId: "s2" }),
          ],
        })
      );
      expect(lastBacked(a.video)).toBe(false);
    });

    it("backs the tile again when a new publisher takes over the slot", () => {
      const a = makeTile("a");
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match("s1", "Alice")],
          participants: [makeParticipant({ sessionId: "s1" })],
        })
      );

      rerender(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match(null)],
          participants: [],
        })
      );
      expect(lastBacked(a.video)).toBe(false);

      rerender(
        baseProps({
          videoElements: [a.video],
          tileMatches: [match(null)],
          participants: [makeParticipant({ sessionId: "s2", name: "Bob" })],
        })
      );
      expect(lastBacked(a.video)).toBe(true);
    });

    it("keeps the pinned tile first even when an earlier tile is unbacked", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const c = makeTile("c");
      const { grid } = renderGrid(
        baseProps({
          videoElements: [a.video, b.video, c.video],
          tileMatches: [match("gone"), match(null), match(null)],
          participants: [makeParticipant({ sessionId: "s2" })],
          pinnedContainer: c.tile,
        })
      );
      expect(lastBacked(a.video)).toBe(false);
      expect(childIds(grid)).toEqual(["c", "a", "b"]);
    });
  });

  describe("camera PiP", () => {
    it("pushes the camera stream and label into every tile", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const stream = new MediaStream();
      renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          cameraStream: stream,
          cameraLabel: "FaceTime HD",
        })
      );
      expect(setTilePipStream).toHaveBeenCalledWith(a.tile, stream);
      expect(setTilePipStream).toHaveBeenCalledWith(b.tile, stream);
      expect(setTilePipLabel).toHaveBeenCalledWith(a.tile, "FaceTime HD");
      expect(setTilePipLabel).toHaveBeenCalledWith(b.tile, "FaceTime HD");
    });

    it("clears the PiP stream from every tile on unmount", () => {
      const a = makeTile("a");
      const stream = new MediaStream();
      const { unmount } = renderGrid(
        baseProps({ videoElements: [a.video], cameraStream: stream })
      );
      setTilePipStream.mockClear();

      unmount();

      expect(setTilePipStream).toHaveBeenCalledWith(a.tile, null);
    });

    it("skips video elements without a parent tile", () => {
      const video = document.createElement("video");
      renderGrid(
        baseProps({ videoElements: [video], cameraStream: new MediaStream() })
      );
      expect(setTilePipStream).not.toHaveBeenCalled();
      expect(updateVideoTileContainerPinned).not.toHaveBeenCalled();
    });
  });

  describe("pin transition overlay", () => {
    it("does not show the overlay on the first pin (no previous pin)", () => {
      const a = makeTile("a");
      const { rerender } = renderGrid(
        baseProps({ videoElements: [a.video], pinnedSessionId: null })
      );
      rerender(baseProps({ videoElements: [a.video], pinnedSessionId: "s1" }));
      expect(setTilePinTransitioning).not.toHaveBeenCalled();
    });

    it("shows the overlay when switching pins and clears it once the pin settles (no rVFC)", async () => {
      const a = makeTile("a");
      const ref = { current: null } as MutableRefObject<Promise<void> | null>;
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s1",
          pinnedContainer: a.tile,
          pendingPinPromiseRef: ref,
        })
      );

      let resolvePin!: () => void;
      ref.current = new Promise<void>((resolve) => {
        resolvePin = resolve;
      });

      rerender(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s2",
          pinnedContainer: a.tile,
          pendingPinPromiseRef: ref,
        })
      );
      expect(setTilePinTransitioning).toHaveBeenCalledWith(a.tile, true);
      expect(setTilePinTransitioning).not.toHaveBeenCalledWith(a.tile, false);

      await act(async () => {
        resolvePin();
        await Promise.resolve();
      });

      expect(setTilePinTransitioning).toHaveBeenLastCalledWith(a.tile, false);
    });

    it("targets every tile when switching pins with no pinned container", () => {
      const a = makeTile("a");
      const b = makeTile("b");
      const ref = {
        current: new Promise<void>(() => {}),
      } as MutableRefObject<Promise<void> | null>;
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video, b.video],
          pinnedSessionId: "s1",
          pendingPinPromiseRef: ref,
        })
      );
      rerender(
        baseProps({
          videoElements: [a.video, b.video],
          pinnedSessionId: "s2",
          pendingPinPromiseRef: ref,
        })
      );
      expect(setTilePinTransitioning).toHaveBeenCalledWith(a.tile, true);
      expect(setTilePinTransitioning).toHaveBeenCalledWith(b.tile, true);
    });

    it("clears the overlay via the 8s safety timer if the pin never settles", () => {
      vi.useFakeTimers();
      const a = makeTile("a");
      const ref = {
        current: new Promise<void>(() => {}),
      } as MutableRefObject<Promise<void> | null>;
      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s1",
          pinnedContainer: a.tile,
          pendingPinPromiseRef: ref,
        })
      );
      rerender(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s2",
          pinnedContainer: a.tile,
          pendingPinPromiseRef: ref,
        })
      );

      act(() => {
        vi.advanceTimersByTime(7999);
      });
      expect(setTilePinTransitioning).not.toHaveBeenCalledWith(a.tile, false);

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(setTilePinTransitioning).toHaveBeenCalledWith(a.tile, false);
      expect(
        setTilePinTransitioning.mock.calls.filter(([, on]) => on === false)
      ).toHaveLength(1);
    });

    it("waits for a frame gap via requestVideoFrameCallback before clearing", async () => {
      const a = makeTile("a");
      const frameCbs: ((
        now: number,
        meta: { presentedFrames: number }
      ) => void)[] = [];
      const rvfc = vi.fn((cb: (typeof frameCbs)[number]) => {
        frameCbs.push(cb);
        return frameCbs.length;
      });
      Object.assign(a.video, { requestVideoFrameCallback: rvfc });
      const nowSpy = vi.spyOn(performance, "now").mockReturnValue(1000);

      const { rerender } = renderGrid(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s1",
          pinnedContainer: a.tile,
        })
      );
      rerender(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s2",
          pinnedContainer: a.tile,
        })
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(rvfc).toHaveBeenCalledTimes(1);

      act(() => {
        frameCbs[0](1050, { presentedFrames: 1 });
      });
      expect(setTilePinTransitioning).not.toHaveBeenCalledWith(a.tile, false);
      expect(rvfc).toHaveBeenCalledTimes(2);

      act(() => {
        frameCbs[1](1300, { presentedFrames: 2 });
      });
      expect(setTilePinTransitioning).toHaveBeenCalledWith(a.tile, false);
      expect(rvfc).toHaveBeenCalledTimes(2);

      nowSpy.mockRestore();
    });

    it("cancels the pending video frame callback and clears the overlay on unmount", async () => {
      const a = makeTile("a");
      const rvfc = vi.fn(() => 42);
      const cvfc = vi.fn();
      Object.assign(a.video, {
        requestVideoFrameCallback: rvfc,
        cancelVideoFrameCallback: cvfc,
      });

      const { rerender, unmount } = renderGrid(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s1",
          pinnedContainer: a.tile,
        })
      );
      rerender(
        baseProps({
          videoElements: [a.video],
          pinnedSessionId: "s2",
          pinnedContainer: a.tile,
        })
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(rvfc).toHaveBeenCalledTimes(1);

      unmount();

      expect(cvfc).toHaveBeenCalledWith(42);
      expect(setTilePinTransitioning).toHaveBeenLastCalledWith(a.tile, false);
    });
  });
});
