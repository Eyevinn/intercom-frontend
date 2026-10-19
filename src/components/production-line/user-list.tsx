import styled from "@emotion/styled";
import { UserIcon, WhipIcon } from "../../assets/icons/icon.tsx";
import { TParticipant } from "./types.ts";
import {
  getStatusClass,
  ListWrapper,
  OnlineIndicator,
  Participant as User,
  ParticipantName as UserName,
  ParticipantRow as UserWrapper,
  truncateParticipantName,
} from "./participant-list-primitives.ts";
import { UserActionSlots } from "./user-action-slots.tsx";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type TIsTalkingIndicator = {
  isTalking: boolean;
};

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
  setKickModalOpen: (value: boolean) => void;
  setKickSessionId: (value: string) => void;
  setKickUserName: (value: string) => void;
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
  setKickModalOpen,
  setKickSessionId,
  setKickUserName,
}: TUserListOptions) => {
  if (!participants) return null;

  const isWhipOnLine = participants.some((p) => p.isWhip);

  const pinnableCount = participants.filter(
    (p) =>
      p.sessionId !== sessionId && p.isActive && p.hasVideo && !p.isWhepReceiver
  ).length;

  return (
    <Container>
      <ListWrapper>
        {participants.map((p) => {
          const isYou = p.sessionId === sessionId;
          const truncatedUsername = truncateParticipantName(p.name);
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
                onRequestKick={(kickSessionId, name) => {
                  setKickSessionId(kickSessionId);
                  setKickUserName(name);
                  setKickModalOpen(true);
                }}
              />
            </UserWrapper>
          );
        })}
      </ListWrapper>
    </Container>
  );
};
