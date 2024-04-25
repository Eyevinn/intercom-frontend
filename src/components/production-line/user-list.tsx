import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { TParticipant } from "./types.ts";
import { UserIcon } from "../../assets/icons/icon.tsx";

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

const User = styled.div<TUserProps>`
  display: flex;
  align-items: center;
  background: #1a1a1a;
  padding: 1rem;
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

  ${({ isYou }) => (isYou ? `background: #353434;` : "")}
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

const IconWrapper = styled.div`
  width: 2rem;
`;

type TUserListOptions = {
  participants: TParticipant[];
  sessionid: string | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
};

export const UserList = ({
  participants,
  sessionid,
  dominantSpeaker,
  audioLevelAboveThreshold,
}: TUserListOptions) => {
  if (!participants) return null;

  return (
    <Container>
      <DisplayContainerHeader>Participants</DisplayContainerHeader>
      <ListWrapper>
        {participants.map((p) => (
          <User key={p.sessionid} isYou={p.sessionid === sessionid}>
            <IsTalkingIndicator
              isTalking={
                audioLevelAboveThreshold && p.endpointid === dominantSpeaker
              }
            >
              <OnlineIndicator isActive={p.isActive}>
                <IconWrapper>
                  <UserIcon />
                </IconWrapper>
              </OnlineIndicator>
            </IsTalkingIndicator>
            {p.name} {p.isActive ? "" : "(inactive)"}
          </User>
        ))}
      </ListWrapper>
    </Container>
  );
};
