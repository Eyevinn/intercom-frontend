import styled from "@emotion/styled";
import {
  MicMuted,
  MicUnmuted,
  VideoOffIcon,
  VideoOnIcon,
} from "../../assets/icons/icon";

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

const Overlay = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 5rem 2rem 2.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s;
  pointer-events: ${({ visible }) => (visible ? "auto" : "none")};
  z-index: 10;
`;

const ToggleButton = styled.button<{ isMuted: boolean }>`
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  background: ${({ isMuted }) =>
    isMuted ? "rgba(220, 50, 50, 0.85)" : "rgba(255, 255, 255, 0.18)"};
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    fill: #e8eaed;
  }
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

type FullscreenControlsProps = {
  visible: boolean;
  hasMic: boolean;
  isInputMuted: boolean;
  hasCamera?: boolean;
  isVideoMuted?: boolean;
  onToggleMute: () => void;
  onToggleVideo?: () => void;
  onExitFullscreen: () => void;
};

export const FullscreenControls = ({
  visible,
  hasMic,
  isInputMuted,
  hasCamera,
  isVideoMuted,
  onToggleMute,
  onToggleVideo,
  onExitFullscreen,
}: FullscreenControlsProps) => (
  <Overlay aria-hidden={!visible} visible={visible}>
    {hasMic && (
      <ToggleButton
        type="button"
        onClick={onToggleMute}
        title={isInputMuted ? "Unmute microphone" : "Mute microphone"}
        isMuted={isInputMuted}
      >
        {isInputMuted ? <MicMuted /> : <MicUnmuted />}
      </ToggleButton>
    )}
    {hasCamera && onToggleVideo && (
      <ToggleButton
        type="button"
        onClick={onToggleVideo}
        title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
        isMuted={!!isVideoMuted}
      >
        {isVideoMuted ? <VideoOffIcon /> : <VideoOnIcon />}
      </ToggleButton>
    )}
    <ExitFullscreenButton
      type="button"
      onClick={onExitFullscreen}
      title="Exit fullscreen"
    >
      <FullscreenExitIcon />
    </ExitFullscreenButton>
  </Overlay>
);
