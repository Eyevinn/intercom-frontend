import styled from "@emotion/styled";
import { UserIcon, WhipIcon } from "../../assets/icons/icon.tsx";
import { TParticipant } from "./types.ts";
import { UserActionSlots } from "./user-action-slots.tsx";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ListWrapper = styled.div`
  border-radius: 1rem;
  border: 0.2rem solid #434343;
`;

type TUserProps = {
  isYou: boolean;
};

type TIsTalkingIndicator = {
  isTalking: boolean;
};

const UserWrapper = styled.div<TUserProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #1a1a1a;
  color: #ddd;
  border: transparent;
  border-bottom: 0.1rem solid #464646;

  &:only-of-type {
    border-radius: 1rem;
    border-bottom: 0;
  }

  &:first-of-type:not(:only-of-type) {
    border-radius: 1rem 1rem 0 0;
  }

  &:last-of-type:not(:only-of-type) {
    border-radius: 0 0 1rem 1rem;
    border-bottom: 0;
  }

  svg {
    fill: #4d4d4d;
    width: 2rem;
  }

  ${({ isYou }) => (isYou ? `background: #353434;` : "")}
`;

const UserName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  /* Prevent descenders (j, g, y, p, q) from being clipped by overflow: hidden */
  line-height: 1.5;
  padding-bottom: 0.2rem;
`;

const User = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
`;

const IsTalkingIndicator = styled.div<TIsTalkingIndicator>`
  width: 4rem;
  height: 4rem;
  border-radius: 5rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ isTalking }) =>
    isTalking
      ? `
  border: 0.3rem solid #ddd;
  `
      : ""}
`;

const OnlineIndicator = styled.div`
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c7c7c7;

  &.user {
    background: #7be27b;
  }

  &.whip {
    background: rgb(89, 203, 232);
  }
`;

type TUserListOptions = {
  participants: TParticipant[];
  sessionId: string | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  programOutputLine?: boolean;
  videoEnabled?: boolean;
  pinnedVideoSessionId?: string | null;
  whepSourceSessionId?: string | null;
  setConfirmModalOpen: (value: boolean) => void;
  setUserId: (value: string) => void;
  setUserName: (value: string) => void;
  onPin?: (sessionId: string) => void;
  onSetWhep?: (sessionId: string) => void;
};

export const UserList = ({
  participants,
  sessionId,
  dominantSpeaker,
  audioLevelAboveThreshold,
  programOutputLine,
  videoEnabled,
  pinnedVideoSessionId,
  whepSourceSessionId,
  setConfirmModalOpen,
  setUserId,
  setUserName,
  onPin,
  onSetWhep,
}: TUserListOptions) => {
  if (!participants) return null;

  const isWhipOnLine = participants.some((p) => p.isWhip);

  const pinnableCount = participants.filter(
    (p) =>
      p.sessionId !== sessionId && p.isActive && p.hasVideo && !p.isWhepReceiver
  ).length;

  const getStatusClass = (isActive: boolean, isWhip: boolean) => {
    if (!isActive) return "inactive";
    return isWhip ? "whip" : "user";
  };

  return (
    <Container>
      <ListWrapper>
        {participants.map((p) => {
          const isYou = p.sessionId === sessionId;
          const truncatedUsername =
            p.name.length > 40 ? `${p.name.slice(0, 40)}...` : p.name;
          return (
            <UserWrapper key={p.sessionId} isYou={isYou}>
              <User title={p.name}>
                <IsTalkingIndicator
                  isTalking={
                    !isWhipOnLine &&
                    audioLevelAboveThreshold &&
                    p.endpointId === dominantSpeaker
                  }
                >
                  <OnlineIndicator
                    className={getStatusClass(p.isActive, p.isWhip)}
                  >
                    {(p.isWhip && <WhipIcon />) || <UserIcon />}
                  </OnlineIndicator>
                </IsTalkingIndicator>
                <UserName>
                  {truncatedUsername} {p.isActive ? "" : "(inactive)"}
                </UserName>
              </User>
              <UserActionSlots
                participant={p}
                isYou={isYou}
                programOutputLine={programOutputLine}
                videoEnabled={videoEnabled}
                pinnedVideoSessionId={pinnedVideoSessionId}
                whepSourceSessionId={whepSourceSessionId}
                pinnableCount={pinnableCount}
                onPin={onPin}
                onSetWhep={onSetWhep}
                onRequestMute={(endpointId, name) => {
                  setUserId(endpointId);
                  setUserName(name);
                  setConfirmModalOpen(true);
                }}
              />
            </UserWrapper>
          );
        })}
      </ListWrapper>
    </Container>
  );
};
