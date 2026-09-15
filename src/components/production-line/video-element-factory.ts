/* eslint-disable no-param-reassign, @typescript-eslint/no-use-before-define */
import fullscreenIcon from "../../assets/icons/fullscreen.svg?raw";
import fullscreenExitIcon from "../../assets/icons/fullscreen_exit.svg?raw";

type VideoWithIOSFullscreen = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};
type DocumentWithIOSFullscreen = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

const enterIOSVideoFullscreen = (videoEl: HTMLVideoElement): boolean => {
  const v = videoEl as VideoWithIOSFullscreen;
  if (typeof v.webkitEnterFullscreen === "function") {
    try {
      v.webkitEnterFullscreen();
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const requestTileFullscreen = (
  container: HTMLElement,
  videoEl: HTMLVideoElement | null
): void => {
  if (typeof container.requestFullscreen === "function") {
    container.requestFullscreen().catch(() => {
      if (videoEl) enterIOSVideoFullscreen(videoEl);
    });
    return;
  }
  if (videoEl) enterIOSVideoFullscreen(videoEl);
};

export const exitTileFullscreen = (): void => {
  const doc = document as DocumentWithIOSFullscreen;
  if (typeof document.exitFullscreen === "function") {
    document.exitFullscreen().catch(() => {});
  } else if (typeof doc.webkitExitFullscreen === "function") {
    doc.webkitExitFullscreen();
  }
};

export const isTileFullscreen = (container: HTMLElement): boolean => {
  const doc = document as DocumentWithIOSFullscreen;
  return (
    document.fullscreenElement === container ||
    doc.webkitFullscreenElement === container
  );
};

export type VideoElementOptions = {
  stream: MediaStream;
  lineId: string;
  endpointId?: string | null;
};

const USER_COLOR = "rgba(123, 226, 123, 0.82)";
const WHIP_COLOR = "rgba(89, 203, 232, 0.82)";

const OPTIONS_BTN_BG_DEFAULT = "rgba(0, 0, 0, 0.45)";
const OPTIONS_BTN_BG_PINNED = "rgba(89, 203, 232, 0.80)";

const ICON_SIZE = "1.8rem";

const setButtonIcon = (btn: HTMLButtonElement, icon: string) => {
  btn.innerHTML = icon;
  const svg = btn.firstElementChild;
  if (!svg) return;
  svg.setAttribute("width", ICON_SIZE);
  svg.setAttribute("height", ICON_SIZE);
  svg.setAttribute("fill", "currentColor");
};

const applyLabelStyle = (label: HTMLSpanElement) => {
  label.style.position = "absolute";
  label.style.bottom = "0.25rem";
  label.style.right = "0.25rem";
  label.style.padding = "0.25rem 0.75rem";
  label.style.borderRadius = "0.5rem 0.25rem 0.25rem 0.25rem";
  label.style.fontSize = "1.4rem";
  label.style.fontWeight = "600";
  label.style.color = "#1a1a1a";
  label.style.maxWidth = "calc(100% - 0.5rem)";
  label.style.overflow = "hidden";
  label.style.textOverflow = "ellipsis";
  label.style.whiteSpace = "nowrap";
  label.style.pointerEvents = "none";
  label.style.display = "none";
};

export const createVideoTileContainer = (): {
  container: HTMLDivElement;
  label: HTMLSpanElement;
} => {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = "100%";
  container.style.aspectRatio = "16 / 9";
  container.style.borderRadius = "0.5rem";
  container.style.overflow = "hidden";
  container.style.backgroundColor = "#000";

  const label = document.createElement("span");
  label.dataset.videoTileLabel = "true";
  applyLabelStyle(label);
  container.appendChild(label);

  const fsBtn = document.createElement("button");
  fsBtn.type = "button";
  fsBtn.style.position = "absolute";
  fsBtn.style.top = "0.25rem";
  fsBtn.style.right = "0.25rem";
  fsBtn.style.width = "2.2rem";
  fsBtn.style.height = "2.2rem";
  fsBtn.style.display = "flex";
  fsBtn.style.alignItems = "center";
  fsBtn.style.justifyContent = "center";
  fsBtn.style.background = OPTIONS_BTN_BG_DEFAULT;
  fsBtn.style.border = "none";
  fsBtn.style.borderRadius = "0.25rem 0.25rem 0.25rem 0.5rem";
  fsBtn.style.cursor = "pointer";
  fsBtn.style.padding = "0";
  fsBtn.style.color = "#D9D9D9";
  fsBtn.style.opacity = "0.7";
  fsBtn.style.transition = "opacity 0.15s, background 0.15s";
  fsBtn.title = "Fullscreen";
  setButtonIcon(fsBtn, fullscreenIcon);

  fsBtn.addEventListener("mouseenter", () => {
    fsBtn.style.opacity = "1";
    fsBtn.style.background = "rgba(0, 0, 0, 0.65)";
  });
  fsBtn.addEventListener("mouseleave", () => {
    fsBtn.style.opacity = "0.7";
    fsBtn.style.background = OPTIONS_BTN_BG_DEFAULT;
  });

  const handleFsChange = () => {
    const isFs = document.fullscreenElement === container;
    setButtonIcon(fsBtn, isFs ? fullscreenExitIcon : fullscreenIcon);
    fsBtn.title = isFs ? "Exit fullscreen" : "Fullscreen";
    const pip = container.querySelector<HTMLDivElement>("[data-camera-pip]");
    if (pip) {
      const pipVideo = pip.querySelector<HTMLVideoElement>("video");
      const hasStream = !!pipVideo?.srcObject;
      pip.style.display = isFs && hasStream ? "block" : "none";
    }
    if (isFs) {
      container.style.aspectRatio = "";
      container.style.height = "100%";
      container.style.borderRadius = "0";
    } else {
      container.style.aspectRatio = "16 / 9";
      container.style.height = "";
      container.style.borderRadius = "0.5rem";
      document.removeEventListener("fullscreenchange", handleFsChange);
    }
  };

  fsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isTileFullscreen(container)) {
      exitTileFullscreen();
    } else {
      document.addEventListener("fullscreenchange", handleFsChange);
      const videoEl = container.querySelector("video");
      requestTileFullscreen(container, videoEl);
      setTimeout(() => {
        if (!isTileFullscreen(container)) {
          document.removeEventListener("fullscreenchange", handleFsChange);
        }
      }, 500);
    }
  });

  container.appendChild(fsBtn);

  const overlay = document.createElement("div");
  overlay.dataset.pinTransitionOverlay = "true";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.display = "none";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.backgroundColor = "#000";
  overlay.style.zIndex = "2";

  const spinner = document.createElement("div");
  spinner.style.width = "3.6rem";
  spinner.style.height = "3.6rem";
  spinner.style.border = "0.35rem solid rgba(255,255,255,0.18)";
  spinner.style.borderTopColor = "rgba(89, 203, 232, 0.95)";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "tile-pin-spin 0.8s linear infinite";
  overlay.appendChild(spinner);

  if (!document.getElementById("tile-pin-spin-keyframes")) {
    const style = document.createElement("style");
    style.id = "tile-pin-spin-keyframes";
    style.textContent =
      "@keyframes tile-pin-spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(style);
  }

  container.appendChild(overlay);

  const pip = document.createElement("div");
  pip.dataset.cameraPip = "true";
  pip.style.display = "none";
  pip.style.position = "absolute";
  pip.style.bottom = "1rem";
  pip.style.left = "1rem";
  pip.style.width = "22rem";
  pip.style.height = "12.375rem";
  pip.style.borderRadius = "0.5rem";
  pip.style.overflow = "hidden";
  pip.style.border = "2px solid rgba(123, 226, 123, 0.55)";
  pip.style.boxShadow = "0 2px 16px rgba(0,0,0,0.7)";
  pip.style.zIndex = "11";

  const pipVideo = document.createElement("video");
  pipVideo.autoplay = true;
  pipVideo.playsInline = true;
  pipVideo.muted = true;
  pipVideo.style.width = "100%";
  pipVideo.style.height = "100%";
  pipVideo.style.objectFit = "cover";
  pipVideo.style.display = "block";
  pipVideo.style.backgroundColor = "#000";
  pip.appendChild(pipVideo);

  const pipLabel = document.createElement("span");
  pipLabel.dataset.cameraPipLabel = "true";
  pipLabel.textContent = "CAM";
  pipLabel.style.position = "absolute";
  pipLabel.style.top = "0.3rem";
  pipLabel.style.left = "0.3rem";
  pipLabel.style.padding = "0.15rem 0.5rem";
  pipLabel.style.borderRadius = "0.25rem";
  pipLabel.style.fontSize = "1.1rem";
  pipLabel.style.fontWeight = "600";
  pipLabel.style.color = "#1a1a1a";
  pipLabel.style.backgroundColor = "rgba(123, 226, 123, 0.82)";
  pipLabel.style.pointerEvents = "none";
  pipLabel.style.letterSpacing = "0.05em";
  pip.appendChild(pipLabel);

  container.appendChild(pip);
  makePipDraggable(pip, container);

  return { container, label };
};

export const makePipDraggable = (
  pip: HTMLElement,
  parent: HTMLElement
): (() => void) => {
  let dragging = false;
  let startClientX = 0;
  let startClientY = 0;
  let startLeft = 0;
  let startTop = 0;

  const switchToPixelPosition = () => {
    const pipRect = pip.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    startLeft = pipRect.left - parentRect.left;
    startTop = pipRect.top - parentRect.top;
    pip.style.left = `${startLeft}px`;
    pip.style.top = `${startTop}px`;
    pip.style.right = "auto";
    pip.style.bottom = "auto";
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragging = true;
    switchToPixelPosition();
    startClientX = e.clientX;
    startClientY = e.clientY;
    pip.setPointerCapture(e.pointerId);
    pip.style.cursor = "grabbing";
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const parentRect = parent.getBoundingClientRect();
    const pipRect = pip.getBoundingClientRect();
    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;
    const maxLeft = parentRect.width - pipRect.width;
    const maxTop = parentRect.height - pipRect.height;
    const nextLeft = clamp(startLeft + dx, 0, Math.max(0, maxLeft));
    const nextTop = clamp(startTop + dy, 0, Math.max(0, maxTop));
    pip.style.left = `${nextLeft}px`;
    pip.style.top = `${nextTop}px`;
  };

  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    try {
      pip.releasePointerCapture(e.pointerId);
    } catch {
      // ignore — pointer may have already been released
    }
    pip.style.cursor = "grab";
  };

  pip.style.cursor = "grab";
  pip.style.touchAction = "none";
  pip.addEventListener("pointerdown", onPointerDown);
  pip.addEventListener("pointermove", onPointerMove);
  pip.addEventListener("pointerup", endDrag);
  pip.addEventListener("pointercancel", endDrag);

  return () => {
    pip.removeEventListener("pointerdown", onPointerDown);
    pip.removeEventListener("pointermove", onPointerMove);
    pip.removeEventListener("pointerup", endDrag);
    pip.removeEventListener("pointercancel", endDrag);
  };
};

export const setTilePipStream = (
  container: HTMLElement,
  stream: MediaStream | null
) => {
  const pipVideo = container.querySelector<HTMLVideoElement>(
    "[data-camera-pip] video"
  );
  if (!pipVideo) return;
  if (pipVideo.srcObject === stream) return;
  pipVideo.srcObject = stream;
  if (stream) pipVideo.play().catch(() => {});
};

export const setTilePipLabel = (
  container: HTMLElement,
  label: string | null
) => {
  const pipLabel = container.querySelector<HTMLSpanElement>(
    "[data-camera-pip] [data-camera-pip-label]"
  );
  if (!pipLabel) return;
  pipLabel.textContent = label && label.trim() ? label : "CAM";
};

export const setTilePinTransitioning = (
  container: HTMLElement,
  on: boolean
) => {
  const overlay = container.querySelector<HTMLDivElement>(
    "[data-pin-transition-overlay]"
  );
  if (!overlay) return;
  overlay.style.display = on ? "flex" : "none";
};

export const updateVideoTileLabel = (
  video: HTMLVideoElement,
  name: string | null,
  isWhip: boolean
) => {
  const container = video.parentElement;
  if (!container) return;
  const label = container.querySelector<HTMLSpanElement>(
    "[data-video-tile-label]"
  );
  if (!label) return;
  if (!name) {
    label.style.display = "none";
    label.textContent = "";
    return;
  }
  label.textContent = name;
  label.style.backgroundColor = isWhip ? WHIP_COLOR : USER_COLOR;
  label.style.display = "inline-block";
};

export const updateVideoTileContainerPinned = (
  container: HTMLElement,
  isPinned: boolean
) => {
  const btn = container.querySelector<HTMLButtonElement>(
    "[data-tile-options-btn]"
  );
  if (!btn) return;
  container.dataset.pinned = isPinned ? "true" : "";
  btn.style.background = isPinned
    ? OPTIONS_BTN_BG_PINNED
    : OPTIONS_BTN_BG_DEFAULT;
  btn.style.opacity = isPinned ? "1" : "0.7";
};

const FRAME_STALL_MS = 3000;

const frameMonitorCleanups = new WeakMap<HTMLVideoElement, () => void>();

export const attachShowWhenReady = (
  videoElement: HTMLVideoElement,
  container: HTMLElement
): void => {
  frameMonitorCleanups.get(videoElement)?.();

  let aborted = false;
  const setVisible = (visible: boolean) => {
    const next = visible ? "block" : "none";
    if (container.style.display === next) return;
    container.style.display = next;
  };

  type RVFCMetadata = { presentedFrames: number };
  type RVFC = (cb: (now: number, metadata: RVFCMetadata) => void) => number;
  type CVFC = (handle: number) => void;
  const rvfc = (videoElement as unknown as { requestVideoFrameCallback?: RVFC })
    .requestVideoFrameCallback;

  // Without rVFC (older WebKit) we can't detect a stall — fall back to the
  // original show-when-ready-only behaviour.
  if (typeof rvfc !== "function") {
    let shown = false;
    const tryShow = () => {
      if (shown) return;
      if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        setVisible(true);
        shown = true;
      }
    };
    tryShow();
    const onEvent = () => tryShow();
    videoElement.addEventListener("loadedmetadata", onEvent);
    videoElement.addEventListener("resize", onEvent);
    videoElement.addEventListener("playing", onEvent);
    videoElement.addEventListener("canplay", onEvent);
    frameMonitorCleanups.set(videoElement, () => {
      aborted = true;
      videoElement.removeEventListener("loadedmetadata", onEvent);
      videoElement.removeEventListener("resize", onEvent);
      videoElement.removeEventListener("playing", onEvent);
      videoElement.removeEventListener("canplay", onEvent);
      frameMonitorCleanups.delete(videoElement);
    });
    return;
  }

  let lastFrameAt = performance.now();
  let lastMediaTime = videoElement.currentTime;
  let lastMediaAdvanceAt = performance.now();
  let frameHandle: number | null = null;
  const onFrame = () => {
    if (aborted) return;
    lastFrameAt = performance.now();
    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      setVisible(true);
    }
    frameHandle = rvfc.call(videoElement, onFrame);
  };
  frameHandle = rvfc.call(videoElement, onFrame);

  const stallTimer = setInterval(() => {
    if (aborted) return;
    const now = performance.now();
    if (videoElement.currentTime > lastMediaTime) {
      lastMediaTime = videoElement.currentTime;
      lastMediaAdvanceAt = now;
    }
    const tracks =
      videoElement.srcObject instanceof MediaStream
        ? videoElement.srcObject.getVideoTracks()
        : [];
    const mediaStopped =
      tracks.length > 0 &&
      tracks.every((t) => t.muted || t.readyState !== "live");
    const framesStalled = now - lastFrameAt > FRAME_STALL_MS;
    const mediaStalled = now - lastMediaAdvanceAt > FRAME_STALL_MS;

    if (framesStalled && mediaStalled && mediaStopped) {
      setVisible(false);
    }
  }, 500);

  frameMonitorCleanups.set(videoElement, () => {
    aborted = true;
    clearInterval(stallTimer);
    if (frameHandle != null) {
      const cvfc = (
        videoElement as unknown as { cancelVideoFrameCallback?: CVFC }
      ).cancelVideoFrameCallback;
      if (typeof cvfc === "function") cvfc.call(videoElement, frameHandle);
    }
    frameMonitorCleanups.delete(videoElement);
  });
};

export const stopFrameMonitor = (videoElement: HTMLVideoElement): void => {
  frameMonitorCleanups.get(videoElement)?.();
};

export const createVideoElement = ({
  stream,
  lineId,
  endpointId = null,
}: VideoElementOptions): HTMLVideoElement => {
  const { container, label } = createVideoTileContainer();

  const videoElement = document.createElement("video");

  videoElement.id = `rtc-video-${lineId}-${Date.now()}`;
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  videoElement.muted = true;
  videoElement.srcObject = stream;

  videoElement.dataset.endpointId = endpointId ?? "";

  videoElement.style.width = "100%";
  videoElement.style.height = "100%";
  videoElement.style.aspectRatio = "16 / 9";
  videoElement.style.objectFit = "cover";
  videoElement.style.backgroundColor = "#000";
  videoElement.style.display = "block";

  label.style.display = "none";

  container.appendChild(videoElement);

  container.style.display = "none";
  attachShowWhenReady(videoElement, container);

  videoElement.play().catch(() => {});

  return videoElement;
};
