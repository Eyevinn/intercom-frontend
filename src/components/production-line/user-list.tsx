import styled from "@emotion/styled";
import {
  LogoutIcon,
  MicMuted,
  UserIcon,
  WhipIcon,
} from "../../assets/icons/icon.tsx";
import { TParticipant } from "./types.ts";
import {
  getStatusClass,
  ListWrapper,
  OnlineIndicator,
  Participant as User,
  ParticipantControls,
  ParticipantName as UserName,
  ParticipantRow as UserWrapper,
  truncateParticipantName,
} from "./participant-list-primitives.ts";

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

const KickParticipantButton = styled.button`
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
    width: 2rem;
  }
`;

type TUserListOptions = {
  participants: TParticipant[];
  sessionId: string | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  programOutputLine?: boolean;
  setConfirmModalOpen: (value: boolean) => void;
  setUserId: (value: string) => void;
  setUserName: (value: string) => void;
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
  setConfirmModalOpen,
  setUserId,
  setUserName,
  setKickModalOpen,
  setKickSessionId,
  setKickUserName,
}: TUserListOptions) => {
  if (!participants) return null;

  const isWhipOnLine = participants.some((p) => p.isWhip);

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
              {!isYou && p.isActive && !programOutputLine && !p.isWhip && (
                <ParticipantControls>
                  <MuteParticipantButton
                    aria-label={`Mute ${p.name}`}
                    title={`Mute ${p.name}`}
                    onClick={() => {
                      setUserId(p.endpointId);
                      setUserName(p.name);
                      setConfirmModalOpen(true);
                    }}
                  >
                    <MicMuted />
                  </MuteParticipantButton>
                  <KickParticipantButton
                    aria-label={`Kick ${p.name}`}
                    title={`Kick ${p.name}`}
                    onClick={() => {
                      setKickSessionId(p.sessionId);
                      setKickUserName(p.name);
                      setKickModalOpen(true);
                    }}
                  >
                    <LogoutIcon />
                  </KickParticipantButton>
                </ParticipantControls>
              )}
            </UserWrapper>
          );
        })}
      </ListWrapper>
    </Container>
  );
};
