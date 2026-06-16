import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { TUseVideoInputValues } from "./use-video-input";
import {
  exitTileFullscreen,
  isTileFullscreen,
  makePipDraggable,
  requestTileFullscreen,
} from "./video-element-factory";

const FullscreenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18px"
    viewBox="0 -960 960 960"
    width="18px"
    fill="currentColor"
  >
    <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
  </svg>
);

const FullscreenExitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18px"
    viewBox="0 -960 960 960"
    width="18px"
    fill="currentColor"
  >
    <path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" />
  </svg>
);

type FullscreenState = {
  isFullscreen: boolean;
  showOverlay: boolean;
};

const Container = styled.div<FullscreenState>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ isFullscreen }) => (isFullscreen ? "auto" : "16 / 9")};
  height: ${({ isFullscreen }) => (isFullscreen ? "100%" : "auto")};
  background-color: #000;
  border-radius: ${({ isFullscreen }) => (isFullscreen ? "0" : "0.5rem")};
  overflow: hidden;
  cursor: ${({ isFullscreen, showOverlay }) =>
    isFullscreen && !showOverlay ? "none" : "default"};
  margin-bottom: ${({ isFullscreen }) => (isFullscreen ? "0" : "0.5rem")};
`;

const ReturnVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
  display: block;
`;

const Label = styled.span<FullscreenState>`
  position: absolute;
  top: 0.3rem;
  left: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  background-color: rgba(89, 203, 232, 0.82);
  pointer-events: none;
  letter-spacing: 0.05em;
  opacity: ${({ isFullscreen, showOverlay }) =>
    isFullscreen && !showOverlay ? 0 : 1};
  transition: opacity 0.3s;
`;

const FullscreenButton = styled.button<FullscreenState>`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #fff;
  padding: 0;
  opacity: ${({ isFullscreen, showOverlay }) => {
    if (!isFullscreen) return 0.7;
    return showOverlay ? 1 : 0;
  }};
  transition: opacity 0.3s;
`;

const PipContainer = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? "block" : "none")};
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: 22rem;
  /* Definite height rather than aspect-ratio: with a <video> child sized at
     height: 100%, WebKit re-derives an aspect-ratio box's height from its
     content on every layout pass, so dragging the PiP inflates it without
     bound (measured 160px -> 26,843,546px in Safari, which then breaks the
     drag clamp). 12.375rem is 22rem * 9/16. */
  height: 12.375rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid rgba(123, 226, 123, 0.55);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.7);
  z-index: 11;
`;

const PipVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background-color: #000;
`;

const PipLabel = styled.span`
  position: absolute;
  top: 0.3rem;
  left: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  background-color: rgba(123, 226, 123, 0.82);
  pointer-events: none;
  letter-spacing: 0.05em;
`;

const FullscreenOverlay = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 5rem 2rem 2.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s;
  pointer-events: ${({ visible }) => (visible ? "auto" : "none")};
`;

const ExitFullscreenButton = styled.button`
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type ReturnFeedTileProps = {
  stream: MediaStream | null;
  cameraStream?: TUseVideoInputValues;
  /** Display name for the return-feed label. Falls back to "Return Feed" when null. */
  label?: string | null;
  /** Display name for the camera PiP inset. Falls back to "CAM" when null. */
  cameraLabel?: string | null;
};

export const ReturnFeedTile = ({
  stream,
  cameraStream,
  label,
  cameraLabel,
}: ReturnFeedTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Sync return-feed stream
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
    if (stream) el.play().catch(() => {});
  }, [stream]);

  // Sync camera PiP stream
  useEffect(() => {
    const el = pipVideoRef.current;
    if (!el) return;
    if (cameraStream && cameraStream !== "no-device") {
      el.srcObject = cameraStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [cameraStream]);

  useEffect(() => {
    const containerEl = containerRef.current;
    const handler = () =>
      setIsFullscreen(!!containerEl && isTileFullscreen(containerEl));
    document.addEventListener("fullscreenchange", handler);
    const videoEl = videoRef.current;
    const onIOSEnter = () => setIsFullscreen(true);
    const onIOSExit = () => setIsFullscreen(false);
    videoEl?.addEventListener("webkitbeginfullscreen", onIOSEnter);
    videoEl?.addEventListener("webkitendfullscreen", onIOSExit);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      videoEl?.removeEventListener("webkitbeginfullscreen", onIOSEnter);
      videoEl?.removeEventListener("webkitendfullscreen", onIOSExit);
    };
  }, []);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  useEffect(() => {
    const pip = pipContainerRef.current;
    const parent = containerRef.current;
    if (!pip || !parent) return undefined;
    return makePipDraggable(pip, parent);
  }, []);

  const revealOverlay = useCallback(() => {
    setShowOverlay(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowOverlay(false), 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    if (isFullscreen) revealOverlay();
  }, [isFullscreen, revealOverlay]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isTileFullscreen(container)) {
      exitTileFullscreen();
    } else {
      requestTileFullscreen(container, videoRef.current);
      revealOverlay();
    }
  }, [revealOverlay]);

  if (!stream) return null;

  const hasCameraPip = !!(cameraStream && cameraStream !== "no-device");
  const overlayVisible = isFullscreen && showOverlay;

  return (
    <Container
      ref={containerRef}
      onMouseMove={handleMouseMove}
      isFullscreen={isFullscreen}
      showOverlay={showOverlay}
    >
      <ReturnVideo ref={videoRef} autoPlay playsInline muted />

      <Label isFullscreen={isFullscreen} showOverlay={showOverlay}>
        {label ?? "Return Feed"}
      </Label>

      <FullscreenButton
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        isFullscreen={isFullscreen}
        showOverlay={showOverlay}
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </FullscreenButton>

      <PipContainer
        ref={pipContainerRef}
        visible={hasCameraPip && isFullscreen}
      >
        <PipVideo ref={pipVideoRef} autoPlay playsInline muted />
        <PipLabel>{cameraLabel?.trim() ? cameraLabel : "CAM"}</PipLabel>
      </PipContainer>

      <FullscreenOverlay aria-hidden={!isFullscreen} visible={overlayVisible}>
        <ExitFullscreenButton
          type="button"
          onClick={toggleFullscreen}
          title="Exit fullscreen"
        >
          <FullscreenExitIcon />
        </ExitFullscreenButton>
      </FullscreenOverlay>
    </Container>
  );
};
