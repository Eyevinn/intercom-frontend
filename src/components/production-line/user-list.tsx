import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { TParticipant } from "./types.ts";
import { MicMuted, UserIcon } from "../../assets/icons/icon.tsx";

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

type TIndicatorProps = {
  isActive: boolean;
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

  &:first-of-type {
    border-radius: 1rem 1rem 0 0;
  }

  &:last-of-type {
    border-radius: 0 0 1rem 1rem;
    border-bottom: 0;
  }

  svg {
    fill: #4d4d4d;
    width: 2rem;
  }

  ${({ isYou }) => (isYou ? `background: #353434;` : "")}
`;

const User = styled.div`
  display: flex;
  align-items: center;
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

const OnlineIndicator = styled.div<TIndicatorProps>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ isActive }) => `background: ${isActive ? "#7be27b;" : "#ebca6a;"}`}
`;

const MuteParticipantButton = styled.button`
  width: 3rem;
  padding: 0.3rem;
  margin: 0;
  background: #302b2b;
  border: 0.1rem solid #707070;
  border-radius: 0.4rem;
  cursor: pointer;

  svg {
    fill: #f96c6c;
  }
`;

type TUserListOptions = {
  participants: TParticipant[];
  sessionId: string | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  setConfirmModalOpen: (value: boolean) => void;
  setUserId: (value: string) => void;
  setUserName: (value: string) => void;
};

export const UserList = ({
  participants,
  sessionId,
  dominantSpeaker,
  audioLevelAboveThreshold,
  setConfirmModalOpen,
  setUserId,
  setUserName,
}: TUserListOptions) => {
  if (!participants) return null;

  return (
    <Container>
      <DisplayContainerHeader>Participants</DisplayContainerHeader>
      <ListWrapper>
        {participants.map((p) => {
          const isYou = p.sessionId === sessionId;
          return (
            <UserWrapper key={p.sessionId} isYou={isYou}>
              <User>
                <IsTalkingIndicator
                  isTalking={
                    audioLevelAboveThreshold && p.endpointId === dominantSpeaker
                  }
                >
                  <OnlineIndicator isActive={p.isActive}>
                    <UserIcon />
                  </OnlineIndicator>
                </IsTalkingIndicator>
                {p.name} {p.isActive ? "" : "(inactive)"}
              </User>
              {!isYou && p.isActive && (
                <MuteParticipantButton
                  onClick={() => {
                    setUserId(p.endpointId);
                    setUserName(p.name);
                    setConfirmModalOpen(true);
                  }}
                >
                  <MicMuted />
                </MuteParticipantButton>
              )}
            </UserWrapper>
          );
        })}
      </ListWrapper>
    </Container>
  );
};
