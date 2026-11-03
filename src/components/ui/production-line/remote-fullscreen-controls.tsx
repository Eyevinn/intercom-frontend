import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FullscreenControls } from "./fullscreen-controls";
import {
  isRemoteVideoTile,
  useOverlayReveal,
} from "./fullscreen-overlay-utils";
import { exitTileFullscreen } from "./video-element-factory";

type DocumentWithIOSFullscreen = Document & {
  webkitFullscreenElement?: Element | null;
};

type RemoteFullscreenControlsProps = {
  gridEl: HTMLElement | null;
  hasMic: boolean;
  isInputMuted: boolean;
  hasCamera?: boolean;
  isVideoMuted?: boolean;
  onToggleMute: () => void;
  onToggleVideo?: () => void;
};

export const RemoteFullscreenControls = ({
  gridEl,
  hasMic,
  isInputMuted,
  hasCamera,
  isVideoMuted,
  onToggleMute,
  onToggleVideo,
}: RemoteFullscreenControlsProps) => {
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const isFullscreen = containerEl !== null;
  const { showOverlay, reveal, handleMouseMove } =
    useOverlayReveal(isFullscreen);

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as DocumentWithIOSFullscreen;
      const fsEl = document.fullscreenElement ?? doc.webkitFullscreenElement;
      if (isRemoteVideoTile(fsEl, gridEl)) {
        setContainerEl(fsEl);
      } else {
        setContainerEl(null);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    // Sync once in case we mounted while already fullscreen.
    handleFsChange();
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [gridEl]);

  useEffect(() => {
    if (!containerEl) return undefined;
    reveal();
    containerEl.addEventListener("mousemove", handleMouseMove);
    return () => {
      containerEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, [containerEl, reveal, handleMouseMove]);

  if (!containerEl) return null;

  return createPortal(
    <FullscreenControls
      visible={showOverlay}
      hasMic={hasMic}
      isInputMuted={isInputMuted}
      onToggleMute={onToggleMute}
      hasCamera={hasCamera}
      isVideoMuted={isVideoMuted}
      onToggleVideo={onToggleVideo}
      onExitFullscreen={exitTileFullscreen}
    />,
    containerEl
  );
};
