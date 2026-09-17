import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { FullscreenControls } from "./fullscreen-controls";
import { useOverlayReveal } from "./fullscreen-overlay-utils";
import { TUseAudioInputValues } from "./use-audio-input";
import { TUseVideoInputValues } from "./use-video-input";
import {
  exitTileFullscreen,
  isTileFullscreen,
  makePipDraggable,
  requestTileFullscreen,
} from "./video-element-factory";

const CameraOffGlyph = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 -960 960 960"
    fill="currentColor"
    aria-hidden
  >
    <path d="M880-260 720-420v67l-80-80v-287H353l-80-80h367q33 0 56.5 23.5T720-720v180l160-160v440ZM822-26 26-822l56-56L878-82l-56 56ZM498-575ZM382-464ZM160-800l80 80h-80v480h480v-80l80 80q0 33-23.5 56.5T640-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Z" />
  </svg>
);

const CameraOffOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.85);
  z-index: 2;
`;

const CameraOffGlyphSlot = styled.span`
  display: inline-flex;
  width: 6rem;
  height: 6rem;
`;

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

const PreviewVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
  display: block;
  transform: scaleX(-1);
`;

const UsernameLabel = styled.span<FullscreenState>`
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem 0.25rem 0.25rem 0.25rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a1a;
  background-color: rgba(123, 226, 123, 0.82);
  max-width: calc(100% - 0.5rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
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

const WHIP_BORDER = "rgba(89, 203, 232, 0.55)";
const WHIP_BG = "rgba(89, 203, 232, 0.82)";
const USER_BORDER = "rgba(123, 226, 123, 0.55)";
const USER_BG = "rgba(123, 226, 123, 0.82)";

const PipContainer = styled.div<{ visible: boolean; isWhip: boolean }>`
  display: ${({ visible }) => (visible ? "block" : "none")};
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: 22rem;
  height: 12.375rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid ${({ isWhip }) => (isWhip ? WHIP_BORDER : USER_BORDER)};
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

const PipLabel = styled.span<{ isWhip: boolean }>`
  position: absolute;
  top: 0.3rem;
  left: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  background-color: ${({ isWhip }) => (isWhip ? WHIP_BG : USER_BG)};
  pointer-events: none;
  letter-spacing: 0.05em;
`;

type SelfPreviewTileProps = {
  stream: TUseVideoInputValues;
  username?: string;
  isInputMuted: boolean;
  inputAudioStream: TUseAudioInputValues;
  pgmStream?: MediaStream | null;
  pinnedRemoteStream?: MediaStream | null;
  pinnedRemoteName?: string | null;
  isPinnedRemoteWhip?: boolean | null;
  isVideoMuted?: boolean;
  hasCamera?: boolean;
  muteInput: () => void;
  toggleVideo?: () => void;
};

export const SelfPreviewTile = ({
  stream,
  username,
  isInputMuted,
  inputAudioStream,
  pgmStream,
  pinnedRemoteStream,
  pinnedRemoteName,
  isPinnedRemoteWhip,
  isVideoMuted,
  hasCamera,
  muteInput,
  toggleVideo,
}: SelfPreviewTileProps) => {
  const pipStream = pgmStream ?? pinnedRemoteStream ?? null;
  const pipLabel = pgmStream ? "PGM" : (pinnedRemoteName ?? "REMOTE");
  const pipIsWhipAccent = pgmStream ? true : isPinnedRemoteWhip !== false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const pgmVideoRef = useRef<HTMLVideoElement>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { showOverlay, reveal, handleMouseMove } =
    useOverlayReveal(isFullscreen);

  // Sync camera stream to video element
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && stream !== "no-device") {
      el.srcObject = stream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    const el = pgmVideoRef.current;
    if (!el) return;
    el.srcObject = pipStream;
    if (pipStream) el.play().catch(() => {});
  }, [pipStream]);

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

  useEffect(() => {
    const pip = pipContainerRef.current;
    const parent = containerRef.current;
    if (!pip || !parent) return undefined;
    return makePipDraggable(pip, parent);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isTileFullscreen(container)) {
      exitTileFullscreen();
    } else {
      requestTileFullscreen(container, videoRef.current);
      reveal();
    }
  }, [reveal]);

  if (!stream || stream === "no-device") return null;

  const hasMic = !!(inputAudioStream && inputAudioStream !== "no-device");
  const overlayVisible = isFullscreen && showOverlay;

  return (
    <Container
      ref={containerRef}
      onMouseMove={handleMouseMove}
      isFullscreen={isFullscreen}
      showOverlay={showOverlay}
    >
      <PreviewVideo ref={videoRef} autoPlay playsInline muted />

      {isVideoMuted && (
        <CameraOffOverlay aria-label="Camera off">
          <CameraOffGlyphSlot>
            <CameraOffGlyph />
          </CameraOffGlyphSlot>
        </CameraOffOverlay>
      )}

      {username && (
        <UsernameLabel isFullscreen={isFullscreen} showOverlay={showOverlay}>
          {username}
        </UsernameLabel>
      )}

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
        visible={!!pipStream && isFullscreen}
        isWhip={pipIsWhipAccent}
      >
        <PipVideo ref={pgmVideoRef} autoPlay playsInline muted />
        <PipLabel isWhip={pipIsWhipAccent}>{pipLabel}</PipLabel>
      </PipContainer>

      <FullscreenControls
        visible={overlayVisible}
        hasMic={hasMic}
        isInputMuted={isInputMuted}
        onToggleMute={muteInput}
        hasCamera={hasCamera}
        isVideoMuted={isVideoMuted}
        onToggleVideo={toggleVideo}
        onExitFullscreen={toggleFullscreen}
      />
    </Container>
  );
};
