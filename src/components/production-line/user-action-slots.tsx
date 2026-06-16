import styled from "@emotion/styled";
import {
  MicMuted,
  PinIcon,
  UnpinIcon,
  WhipIcon,
} from "../../assets/icons/icon.tsx";
import { Tooltip } from "../tooltip/tooltip.tsx";
import { TParticipant } from "./types.ts";

const MuteParticipantButton = styled.button`
  width: 3rem;
  height: 3rem;
  padding: 0.3rem;
  margin: 0 0 0 0.5rem;
  background: #302b2b;
  border: 0.1rem solid #707070;
  border-radius: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    fill: #f96c6c;
    display: block;
  }
`;

type TVideoOptionsButtonProps = { isActive: boolean };

const VideoOptionsButton = styled.button<TVideoOptionsButtonProps>`
  width: 3rem;
  height: 3rem;
  padding: 0.3rem;
  margin: 0 0 0 0.5rem;
  background: ${({ isActive }) =>
    isActive ? "rgba(89, 203, 232, 0.25)" : "#302b2b"};
  border: 0.1rem solid
    ${({ isActive }) => (isActive ? "rgb(89, 203, 232)" : "#707070")};
  border-radius: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  && svg {
    fill: ${({ isActive }) => (isActive ? "rgb(89, 203, 232)" : "#D9D9D9")};
    display: block;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const ActiveIconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  margin: 0 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  && svg {
    fill: rgb(89, 203, 232);
    display: block;
    width: 3rem;
    height: 3rem;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Slot = styled.div`
  width: 3rem;
  height: 3rem;
  margin: 0 0 0 0.5rem;
  flex-shrink: 0;
`;

type UserActionSlotsProps = {
  participant: TParticipant;
  isYou: boolean;
  programOutputLine?: boolean;
  videoEnabled?: boolean;
  pinnedVideoSessionId?: string | null;
  whepSourceSessionId?: string | null;
  pinnableCount: number;
  onPin?: (sessionId: string) => void;
  onSetWhep?: (sessionId: string) => void;
  onRequestMute: (endpointId: string, name: string) => void;
};

export const UserActionSlots = ({
  participant: p,
  isYou,
  programOutputLine,
  videoEnabled,
  pinnedVideoSessionId,
  whepSourceSessionId,
  pinnableCount,
  onPin,
  onSetWhep,
  onRequestMute,
}: UserActionSlotsProps) => {
  const canTargetVideo =
    !isYou &&
    p.isActive &&
    !programOutputLine &&
    !p.isWhepReceiver &&
    p.hasVideo;
  const showWhepControl = !!videoEnabled && canTargetVideo && !!onSetWhep;
  const showPinControl = !!videoEnabled && canTargetVideo && !!onPin;
  const showMuteControl =
    !isYou && p.isActive && !programOutputLine && !p.isWhip;

  const isPinned = pinnedVideoSessionId === p.sessionId;
  const pinDisabled = isPinned && pinnableCount <= 1;
  let pinTooltip = "Pin video";
  if (pinDisabled) {
    pinTooltip = "Can't unpin — they're the only available video source";
  } else if (isPinned) {
    pinTooltip = "Unpin video";
  }

  let whepTooltip = "Set as WHEP source";
  if (whepSourceSessionId === p.sessionId) {
    whepTooltip = "Clear WHEP source";
  } else if (p.isWhip) {
    whepTooltip = "WHIP session can not be WHEP source";
  }

  const showSelfWhepIndicator = isYou && p.sessionId === whepSourceSessionId;

  return (
    <Wrapper>
      {showWhepControl ? (
        <Tooltip tooltipText={whepTooltip}>
          <VideoOptionsButton
            isActive={whepSourceSessionId === p.sessionId}
            disabled={p.isWhip}
            onClick={() => onSetWhep?.(p.sessionId)}
          >
            <WhipIcon />
          </VideoOptionsButton>
        </Tooltip>
      ) : (
        videoEnabled && <Slot />
      )}
      {showPinControl ? (
        <Tooltip tooltipText={pinTooltip}>
          <VideoOptionsButton
            isActive={isPinned}
            disabled={pinDisabled}
            onClick={() => onPin?.(p.sessionId)}
          >
            {isPinned ? <UnpinIcon /> : <PinIcon />}
          </VideoOptionsButton>
        </Tooltip>
      ) : (
        videoEnabled && <Slot />
      )}
      {/* eslint-disable-next-line no-nested-ternary */}
      {showMuteControl ? (
        <Tooltip tooltipText={`Mute ${p.name}`}>
          <MuteParticipantButton
            onClick={() => onRequestMute(p.endpointId, p.name)}
          >
            <MicMuted />
          </MuteParticipantButton>
        </Tooltip>
      ) : showSelfWhepIndicator ? (
        <Tooltip tooltipText="You're the current WHEP source for this line">
          <ActiveIconWrapper>
            <WhipIcon />
          </ActiveIconWrapper>
        </Tooltip>
      ) : (
        <Slot />
      )}
    </Wrapper>
  );
};
