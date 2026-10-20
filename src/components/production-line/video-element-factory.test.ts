import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  attachShowWhenReady,
  createVideoElement,
  createVideoTileContainer,
  exitTileFullscreen,
  isTileFullscreen,
  makePipDraggable,
  requestTileFullscreen,
  setTilePinTransitioning,
  setTilePipLabel,
  setTilePipStream,
  stopFrameMonitor,
  updateVideoTileContainerPinned,
  updateVideoTileLabel,
} from "./video-element-factory.ts";

const OPTIONS_BTN_BG_DEFAULT = "rgba(0, 0, 0, 0.45)";
const OPTIONS_BTN_BG_PINNED = "rgba(89, 203, 232, 0.80)";

type FakeTrack = { muted: boolean; readyState: "live" | "ended" };
type FrameCallback = (
  now: number,
  metadata: { presentedFrames: number }
) => void;

const createStream = (tracks: FakeTrack[] = []): MediaStream => {
  const stream = new MediaStream();
  vi.spyOn(stream, "getVideoTracks").mockReturnValue(
    tracks as unknown as MediaStreamTrack[]
  );
  return stream;
};

const setVideoSize = (video: HTMLVideoElement, w: number, h: number) => {
  Object.defineProperty(video, "videoWidth", { value: w, configurable: true });
  Object.defineProperty(video, "videoHeight", { value: h, configurable: true });
};

const installRvfc = (video: HTMLVideoElement) => {
  const pending: FrameCallback[] = [];
  let nextHandle = 0;
  const requestVideoFrameCallback = vi.fn((cb: FrameCallback) => {
    pending.push(cb);
    nextHandle += 1;
    return nextHandle;
  });
  const cancelVideoFrameCallback = vi.fn();
  Object.assign(video, { requestVideoFrameCallback, cancelVideoFrameCallback });
  const fireFrame = () => {
    const cb = pending.shift();
    if (!cb) throw new Error("no pending video frame callback");
    cb(performance.now(), { presentedFrames: 1 });
  };
  return {
    requestVideoFrameCallback,
    cancelVideoFrameCallback,
    fireFrame,
    lastHandle: () => nextHandle,
  };
};

const getTileParts = (container: HTMLElement) => ({
  label: container.querySelector<HTMLSpanElement>("[data-video-tile-label]"),
  optionsBtn: container.querySelector<HTMLButtonElement>(
    "[data-tile-options-btn]"
  ),
  overlay: container.querySelector<HTMLDivElement>(
    "[data-pin-transition-overlay]"
  ),
  pip: container.querySelector<HTMLDivElement>("[data-camera-pip]"),
  pipVideo: container.querySelector<HTMLVideoElement>(
    "[data-camera-pip] video"
  ),
  pipLabel: container.querySelector<HTMLSpanElement>(
    "[data-camera-pip] [data-camera-pip-label]"
  ),
});

describe("video-element-factory", () => {
  let playSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("createVideoElement", () => {
    it("creates a muted, inline, autoplaying video element", () => {
      const el = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
      });

      expect(el).toBeInstanceOf(HTMLVideoElement);
      expect(el.autoplay).toBe(true);
      expect(el.playsInline).toBe(true);
      expect(el.muted).toBe(true);
      stopFrameMonitor(el);
    });

    it("sets srcObject to the provided stream", () => {
      const stream = createStream();
      const el = createVideoElement({ stream, lineId: "line-1" });

      expect(el.srcObject).toBe(stream);
      stopFrameMonitor(el);
    });

    it("sets an id containing the lineId", () => {
      const el = createVideoElement({
        stream: createStream(),
        lineId: "my-line",
      });

      expect(el.id).toContain("rtc-video-my-line-");
      stopFrameMonitor(el);
    });

    it("stores the endpointId in the dataset", () => {
      const el = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
        endpointId: "endpoint-42",
      });

      expect(el.dataset.endpointId).toBe("endpoint-42");
      stopFrameMonitor(el);
    });

    it("defaults dataset.endpointId to an empty string when omitted or null", () => {
      const omitted = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
      });
      const nulled = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
        endpointId: null,
      });

      expect(omitted.dataset.endpointId).toBe("");
      expect(nulled.dataset.endpointId).toBe("");
      stopFrameMonitor(omitted);
      stopFrameMonitor(nulled);
    });

    it("calls play() on the created element", () => {
      const el = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
      });

      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy.mock.contexts[0]).toBe(el);
      stopFrameMonitor(el);
    });

    it("swallows a rejected play() (e.g. autoplay blocked)", async () => {
      playSpy.mockRejectedValue(new Error("NotAllowedError"));

      const el = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
      });

      await Promise.resolve();
      await Promise.resolve();
      expect(el).toBeInstanceOf(HTMLVideoElement);
      stopFrameMonitor(el);
    });

    it("mounts the video inside a hidden tile container", () => {
      const el = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
      });
      const container = el.parentElement as HTMLDivElement;

      expect(container).toBeInstanceOf(HTMLDivElement);
      expect(container.style.display).toBe("none");
      expect(container.lastElementChild).toBe(el);
      const parts = getTileParts(container);
      expect(parts.label).not.toBeNull();
      expect(parts.optionsBtn).not.toBeNull();
      expect(parts.overlay).not.toBeNull();
      expect(parts.pip).not.toBeNull();
      stopFrameMonitor(el);
    });

    it("reveals the tile once the video reports dimensions (no-rVFC fallback)", () => {
      const el = createVideoElement({
        stream: createStream(),
        lineId: "line-1",
      });
      const container = el.parentElement as HTMLDivElement;

      el.dispatchEvent(new Event("loadedmetadata"));
      expect(container.style.display).toBe("none");

      setVideoSize(el, 1280, 720);
      el.dispatchEvent(new Event("loadedmetadata"));
      expect(container.style.display).toBe("block");
      stopFrameMonitor(el);
    });
  });

  describe("createVideoTileContainer", () => {
    it("returns a 16:9 relative container and its label", () => {
      const { container, label } = createVideoTileContainer();

      expect(container.style.position).toBe("relative");
      expect(container.style.aspectRatio).toBe("16 / 9");
      expect(label.dataset.videoTileLabel).toBe("true");
      expect(label.style.display).toBe("none");
      expect(container.contains(label)).toBe(true);
    });

    it("includes a fullscreen options button marked with data-tile-options-btn", () => {
      const { container } = createVideoTileContainer();
      const btn = getTileParts(container).optionsBtn;

      expect(btn).toBeInstanceOf(HTMLButtonElement);
      expect(btn?.dataset.tileOptionsBtn).toBe("true");
      expect(btn?.type).toBe("button");
      expect(btn?.title).toBe("Fullscreen");
      expect(btn?.style.background).toBe(OPTIONS_BTN_BG_DEFAULT);
      const svg = btn?.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("width")).toBe("1.8rem");
      expect(svg?.getAttribute("height")).toBe("1.8rem");
      expect(svg?.getAttribute("fill")).toBe("currentColor");
    });

    it("includes a hidden pin-transition overlay", () => {
      const { container } = createVideoTileContainer();
      const { overlay } = getTileParts(container);

      expect(overlay?.dataset.pinTransitionOverlay).toBe("true");
      expect(overlay?.style.display).toBe("none");
    });

    it("includes a hidden, draggable camera PiP with a muted video and CAM label", () => {
      const { container } = createVideoTileContainer();
      const { pip, pipVideo, pipLabel } = getTileParts(container);

      expect(pip?.dataset.cameraPip).toBe("true");
      expect(pip?.style.display).toBe("none");
      expect(pip?.style.cursor).toBe("grab");
      expect(pip?.style.touchAction).toBe("none");
      expect(pipVideo?.muted).toBe(true);
      expect(pipVideo?.autoplay).toBe(true);
      expect(pipVideo?.playsInline).toBe(true);
      expect(pipLabel?.textContent).toBe("CAM");
    });

    it("injects the spinner keyframes stylesheet only once", () => {
      createVideoTileContainer();
      createVideoTileContainer();

      expect(
        document.head.querySelectorAll("#tile-pin-spin-keyframes")
      ).toHaveLength(1);
    });

    it("restores the pinned resting style on mouseleave", () => {
      const { container } = createVideoTileContainer();
      const btn = getTileParts(container).optionsBtn as HTMLButtonElement;

      btn.dispatchEvent(new Event("mouseenter"));
      expect(btn.style.opacity).toBe("1");

      btn.dispatchEvent(new Event("mouseleave"));
      expect(btn.style.background).toBe(OPTIONS_BTN_BG_DEFAULT);
      expect(btn.style.opacity).toBe("0.7");

      updateVideoTileContainerPinned(container, true);
      btn.dispatchEvent(new Event("mouseenter"));
      btn.dispatchEvent(new Event("mouseleave"));
      expect(btn.style.background).toBe(OPTIONS_BTN_BG_PINNED);
      expect(btn.style.opacity).toBe("1");
    });
  });

  describe("tile fullscreen button", () => {
    afterEach(() => {
      Reflect.deleteProperty(document, "fullscreenElement");
      Reflect.deleteProperty(document, "exitFullscreen");
    });

    const setFullscreenElement = (el: Element | null) => {
      Object.defineProperty(document, "fullscreenElement", {
        value: el,
        configurable: true,
      });
    };

    it("requests fullscreen on the container when clicked", () => {
      vi.useFakeTimers();
      const { container } = createVideoTileContainer();
      const requestFullscreen = vi.fn().mockResolvedValue(undefined);
      container.requestFullscreen = requestFullscreen;

      getTileParts(container).optionsBtn?.click();

      expect(requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it("swaps to exit state on fullscreenchange and back when leaving", () => {
      vi.useFakeTimers();
      const { container } = createVideoTileContainer();
      container.requestFullscreen = vi.fn().mockResolvedValue(undefined);
      setTilePipStream(container, createStream());
      const { optionsBtn, pip } = getTileParts(container);

      optionsBtn?.click();
      setFullscreenElement(container);
      document.dispatchEvent(new Event("fullscreenchange"));

      expect(optionsBtn?.title).toBe("Exit fullscreen");
      expect(container.style.height).toBe("100%");
      expect(container.style.aspectRatio).toBe("");
      expect(pip?.style.display).toBe("block");

      setFullscreenElement(null);
      document.dispatchEvent(new Event("fullscreenchange"));

      expect(optionsBtn?.title).toBe("Fullscreen");
      expect(container.style.aspectRatio).toBe("16 / 9");
      expect(pip?.style.display).toBe("none");
    });

    it("keeps the PiP hidden in fullscreen when no camera stream is set", () => {
      vi.useFakeTimers();
      const { container } = createVideoTileContainer();
      container.requestFullscreen = vi.fn().mockResolvedValue(undefined);
      const { optionsBtn, pip } = getTileParts(container);

      optionsBtn?.click();
      setFullscreenElement(container);
      document.dispatchEvent(new Event("fullscreenchange"));

      expect(pip?.style.display).toBe("none");
    });

    it("exits fullscreen when clicked while the tile is fullscreen", () => {
      const { container } = createVideoTileContainer();
      const requestFullscreen = vi.fn().mockResolvedValue(undefined);
      container.requestFullscreen = requestFullscreen;
      const exitFullscreen = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(document, "exitFullscreen", {
        value: exitFullscreen,
        configurable: true,
      });
      setFullscreenElement(container);

      getTileParts(container).optionsBtn?.click();

      expect(exitFullscreen).toHaveBeenCalledTimes(1);
      expect(requestFullscreen).not.toHaveBeenCalled();
    });
  });

  describe("fullscreen helpers", () => {
    afterEach(() => {
      Reflect.deleteProperty(document, "fullscreenElement");
      Reflect.deleteProperty(document, "webkitFullscreenElement");
      Reflect.deleteProperty(document, "exitFullscreen");
      Reflect.deleteProperty(document, "webkitExitFullscreen");
    });

    it("requestTileFullscreen falls back to webkitEnterFullscreen when requestFullscreen rejects", async () => {
      const container = document.createElement("div");
      container.requestFullscreen = vi
        .fn()
        .mockRejectedValue(new Error("not allowed"));
      const video = document.createElement("video");
      const webkitEnterFullscreen = vi.fn();
      Object.assign(video, { webkitEnterFullscreen });

      requestTileFullscreen(container, video);

      await vi.waitFor(() => {
        expect(webkitEnterFullscreen).toHaveBeenCalledTimes(1);
      });
    });

    it("requestTileFullscreen uses webkitEnterFullscreen when requestFullscreen is missing (iOS)", () => {
      const container = document.createElement("div");
      Object.defineProperty(container, "requestFullscreen", {
        value: undefined,
        configurable: true,
      });
      const video = document.createElement("video");
      const webkitEnterFullscreen = vi.fn();
      Object.assign(video, { webkitEnterFullscreen });

      requestTileFullscreen(container, video);

      expect(webkitEnterFullscreen).toHaveBeenCalledTimes(1);
    });

    it("isTileFullscreen honours both the standard and webkit fullscreen element", () => {
      const container = document.createElement("div");
      expect(isTileFullscreen(container)).toBe(false);

      Object.defineProperty(document, "webkitFullscreenElement", {
        value: container,
        configurable: true,
      });
      expect(isTileFullscreen(container)).toBe(true);

      Reflect.deleteProperty(document, "webkitFullscreenElement");
      Object.defineProperty(document, "fullscreenElement", {
        value: container,
        configurable: true,
      });
      expect(isTileFullscreen(container)).toBe(true);
    });

    it("exitTileFullscreen prefers exitFullscreen and falls back to webkitExitFullscreen", () => {
      const exitFullscreen = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(document, "exitFullscreen", {
        value: exitFullscreen,
        configurable: true,
      });
      exitTileFullscreen();
      expect(exitFullscreen).toHaveBeenCalledTimes(1);

      const webkitExitFullscreen = vi.fn();
      Object.defineProperty(document, "exitFullscreen", {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(document, "webkitExitFullscreen", {
        value: webkitExitFullscreen,
        configurable: true,
      });
      exitTileFullscreen();
      expect(webkitExitFullscreen).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateVideoTileContainerPinned", () => {
    it("sets dataset.pinned to 'true' and applies the pinned button style", () => {
      const { container } = createVideoTileContainer();
      const btn = getTileParts(container).optionsBtn as HTMLButtonElement;

      updateVideoTileContainerPinned(container, true);

      expect(container.dataset.pinned).toBe("true");
      expect(btn.style.background).toBe(OPTIONS_BTN_BG_PINNED);
      expect(btn.style.opacity).toBe("1");
    });

    it("clears dataset.pinned and restores the default button style when unpinned", () => {
      const { container } = createVideoTileContainer();
      const btn = getTileParts(container).optionsBtn as HTMLButtonElement;

      updateVideoTileContainerPinned(container, true);
      updateVideoTileContainerPinned(container, false);

      expect(container.dataset.pinned).toBe("");
      expect(container.dataset.pinned === "true").toBe(false);
      expect(btn.style.background).toBe(OPTIONS_BTN_BG_DEFAULT);
      expect(btn.style.opacity).toBe("0.7");
    });

    it("is a no-op for a container without an options button", () => {
      const container = document.createElement("div");

      updateVideoTileContainerPinned(container, true);

      expect(container.dataset.pinned).toBeUndefined();
    });
  });

  describe("tile label / PiP / overlay helpers", () => {
    const mountVideo = () => {
      const { container, label } = createVideoTileContainer();
      const video = document.createElement("video");
      container.appendChild(video);
      return { container, label, video };
    };

    it("updateVideoTileLabel shows the name with the user colour", () => {
      const { label, video } = mountVideo();

      updateVideoTileLabel(video, "Alice", false);

      expect(label.textContent).toBe("Alice");
      expect(label.style.display).toBe("inline-block");
      expect(label.style.backgroundColor).toBe("rgba(123, 226, 123, 0.82)");
    });

    it("updateVideoTileLabel uses the WHIP colour for WHIP sources", () => {
      const { label, video } = mountVideo();

      updateVideoTileLabel(video, "Studio cam", true);

      expect(label.style.backgroundColor).toBe("rgba(89, 203, 232, 0.82)");
    });

    it("updateVideoTileLabel hides and clears the label when name is null", () => {
      const { label, video } = mountVideo();
      updateVideoTileLabel(video, "Alice", false);

      updateVideoTileLabel(video, null, false);

      expect(label.textContent).toBe("");
      expect(label.style.display).toBe("none");
    });

    it("updateVideoTileLabel does nothing for a detached video", () => {
      const video = document.createElement("video");

      expect(() => updateVideoTileLabel(video, "Alice", false)).not.toThrow();
    });

    it("setTilePipStream assigns the stream and plays it once", () => {
      const { container } = createVideoTileContainer();
      const { pipVideo } = getTileParts(container);
      const stream = createStream();

      setTilePipStream(container, stream);
      setTilePipStream(container, stream);

      expect(pipVideo?.srcObject).toBe(stream);
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it("setTilePipStream clears the stream without calling play()", () => {
      const { container } = createVideoTileContainer();
      const { pipVideo } = getTileParts(container);
      setTilePipStream(container, createStream());
      playSpy.mockClear();

      setTilePipStream(container, null);

      expect(pipVideo?.srcObject).toBeNull();
      expect(playSpy).not.toHaveBeenCalled();
    });

    it("setTilePipLabel sets the label and falls back to CAM for blank names", () => {
      const { container } = createVideoTileContainer();
      const { pipLabel } = getTileParts(container);

      setTilePipLabel(container, "Bob");
      expect(pipLabel?.textContent).toBe("Bob");

      setTilePipLabel(container, "   ");
      expect(pipLabel?.textContent).toBe("CAM");

      setTilePipLabel(container, null);
      expect(pipLabel?.textContent).toBe("CAM");
    });

    it("setTilePinTransitioning toggles the overlay", () => {
      const { container } = createVideoTileContainer();
      const { overlay } = getTileParts(container);

      setTilePinTransitioning(container, true);
      expect(overlay?.style.display).toBe("flex");

      setTilePinTransitioning(container, false);
      expect(overlay?.style.display).toBe("none");
    });
  });

  describe("makePipDraggable", () => {
    const setup = () => {
      const parent = document.createElement("div");
      const pip = document.createElement("div");
      parent.appendChild(pip);
      document.body.appendChild(parent);
      vi.spyOn(parent, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
      } as DOMRect);
      vi.spyOn(pip, "getBoundingClientRect").mockReturnValue({
        left: 20,
        top: 200,
        width: 100,
        height: 50,
      } as DOMRect);
      const setPointerCapture = vi.fn();
      const releasePointerCapture = vi.fn();
      Object.assign(pip, { setPointerCapture, releasePointerCapture });
      const cleanup = makePipDraggable(pip, parent);
      return { pip, cleanup, setPointerCapture, releasePointerCapture };
    };

    const pointer = (
      type: string,
      clientX: number,
      clientY: number,
      button = 0
    ) =>
      new PointerEvent(type, {
        clientX,
        clientY,
        button,
        pointerId: 1,
        pointerType: "mouse",
        bubbles: true,
        cancelable: true,
      });

    it("moves the PiP with the pointer and clamps it inside the parent", () => {
      const { pip, setPointerCapture, releasePointerCapture } = setup();

      pip.dispatchEvent(pointer("pointerdown", 50, 220));
      expect(setPointerCapture).toHaveBeenCalledWith(1);
      expect(pip.style.left).toBe("20px");
      expect(pip.style.top).toBe("200px");
      expect(pip.style.cursor).toBe("grabbing");

      pip.dispatchEvent(pointer("pointermove", 80, 200));
      expect(pip.style.left).toBe("50px");
      expect(pip.style.top).toBe("180px");

      pip.dispatchEvent(pointer("pointermove", 5000, 5000));
      expect(pip.style.left).toBe("300px");
      expect(pip.style.top).toBe("250px");

      pip.dispatchEvent(pointer("pointerup", 5000, 5000));
      expect(releasePointerCapture).toHaveBeenCalledWith(1);
      expect(pip.style.cursor).toBe("grab");

      pip.dispatchEvent(pointer("pointermove", 0, 0));
      expect(pip.style.left).toBe("300px");
    });

    it("ignores non-primary mouse buttons", () => {
      const { pip, setPointerCapture } = setup();

      pip.dispatchEvent(pointer("pointerdown", 50, 220, 2));

      expect(setPointerCapture).not.toHaveBeenCalled();
      expect(pip.style.cursor).toBe("grab");
    });

    it("stops reacting to pointer events after cleanup", () => {
      const { pip, cleanup, setPointerCapture } = setup();

      cleanup();
      pip.dispatchEvent(pointer("pointerdown", 50, 220));

      expect(setPointerCapture).not.toHaveBeenCalled();
    });
  });

  describe("attachShowWhenReady / stopFrameMonitor (rVFC path)", () => {
    const setup = (tracks: FakeTrack[] = []) => {
      vi.useFakeTimers({
        toFake: [
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "performance",
          "Date",
        ],
      });
      const container = document.createElement("div");
      container.style.display = "none";
      const video = document.createElement("video");
      video.srcObject = createStream(tracks);
      container.appendChild(video);
      const rvfc = installRvfc(video);
      return { container, video, rvfc };
    };

    it("starts a frame callback loop and a stall interval", () => {
      const { container, video, rvfc } = setup();

      attachShowWhenReady(video, container);

      expect(rvfc.requestVideoFrameCallback).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(1);
      stopFrameMonitor(video);
    });

    it("shows the container only after a frame with real dimensions", () => {
      const { container, video, rvfc } = setup();
      attachShowWhenReady(video, container);

      rvfc.fireFrame();
      expect(container.style.display).toBe("none");
      expect(rvfc.requestVideoFrameCallback).toHaveBeenCalledTimes(2);

      setVideoSize(video, 640, 360);
      rvfc.fireFrame();
      expect(container.style.display).toBe("block");
      stopFrameMonitor(video);
    });

    it("hides the container when frames, media time and tracks all stall", () => {
      const { container, video, rvfc } = setup([
        { muted: true, readyState: "live" },
      ]);
      setVideoSize(video, 640, 360);
      attachShowWhenReady(video, container);
      rvfc.fireFrame();
      expect(container.style.display).toBe("block");

      vi.advanceTimersByTime(3000);
      expect(container.style.display).toBe("block");

      vi.advanceTimersByTime(500);
      expect(container.style.display).toBe("none");
      stopFrameMonitor(video);
    });

    it("keeps the container visible while the track is live and unmuted", () => {
      const { container, video, rvfc } = setup([
        { muted: false, readyState: "live" },
      ]);
      setVideoSize(video, 640, 360);
      attachShowWhenReady(video, container);
      rvfc.fireFrame();

      vi.advanceTimersByTime(10_000);

      expect(container.style.display).toBe("block");
      stopFrameMonitor(video);
    });

    it("keeps the container visible while media time keeps advancing", () => {
      const { container, video, rvfc } = setup([
        { muted: false, readyState: "ended" },
      ]);
      setVideoSize(video, 640, 360);
      attachShowWhenReady(video, container);
      rvfc.fireFrame();

      for (let i = 1; i <= 20; i += 1) {
        video.currentTime = i;
        vi.advanceTimersByTime(500);
      }

      expect(container.style.display).toBe("block");
      stopFrameMonitor(video);
    });

    it("stopFrameMonitor clears the interval and cancels the pending rVFC", () => {
      const { container, video, rvfc } = setup([
        { muted: true, readyState: "live" },
      ]);
      setVideoSize(video, 640, 360);
      attachShowWhenReady(video, container);
      rvfc.fireFrame();
      expect(vi.getTimerCount()).toBe(1);

      stopFrameMonitor(video);

      expect(vi.getTimerCount()).toBe(0);
      expect(rvfc.cancelVideoFrameCallback).toHaveBeenCalledWith(
        rvfc.lastHandle()
      );

      vi.advanceTimersByTime(10_000);
      expect(container.style.display).toBe("block");
    });

    it("ignores frame callbacks that arrive after stopFrameMonitor", () => {
      const { container, video, rvfc } = setup();
      attachShowWhenReady(video, container);

      stopFrameMonitor(video);
      setVideoSize(video, 640, 360);
      rvfc.fireFrame();

      expect(container.style.display).toBe("none");
      expect(rvfc.requestVideoFrameCallback).toHaveBeenCalledTimes(1);
    });

    it("re-attaching tears down the previous monitor first", () => {
      const { container, video, rvfc } = setup();

      attachShowWhenReady(video, container);
      attachShowWhenReady(video, container);

      expect(vi.getTimerCount()).toBe(1);
      expect(rvfc.cancelVideoFrameCallback).toHaveBeenCalledTimes(1);
      stopFrameMonitor(video);
      expect(vi.getTimerCount()).toBe(0);
    });

    it("stopFrameMonitor is a no-op for an unmonitored element", () => {
      const video = document.createElement("video");

      expect(() => stopFrameMonitor(video)).not.toThrow();
    });
  });

  describe("attachShowWhenReady (no-rVFC fallback)", () => {
    it("shows immediately when dimensions are already known", () => {
      const container = document.createElement("div");
      container.style.display = "none";
      const video = document.createElement("video");
      setVideoSize(video, 640, 360);

      attachShowWhenReady(video, container);

      expect(container.style.display).toBe("block");
      stopFrameMonitor(video);
    });

    it("shows on media events once dimensions appear", () => {
      const container = document.createElement("div");
      container.style.display = "none";
      const video = document.createElement("video");
      attachShowWhenReady(video, container);

      video.dispatchEvent(new Event("playing"));
      expect(container.style.display).toBe("none");

      setVideoSize(video, 640, 360);
      video.dispatchEvent(new Event("resize"));
      expect(container.style.display).toBe("block");
      stopFrameMonitor(video);
    });

    it("stopFrameMonitor removes the media event listeners", () => {
      const container = document.createElement("div");
      container.style.display = "none";
      const video = document.createElement("video");
      attachShowWhenReady(video, container);

      stopFrameMonitor(video);
      setVideoSize(video, 640, 360);
      ["loadedmetadata", "resize", "playing", "canplay"].forEach((type) =>
        video.dispatchEvent(new Event(type))
      );

      expect(container.style.display).toBe("none");
    });
  });
});
