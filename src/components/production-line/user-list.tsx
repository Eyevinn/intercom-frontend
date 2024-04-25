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
  firstPerson: boolean;
  lastPerson: boolean;
  onlyPerson: boolean;
  isYou: boolean;
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

  ${({ firstPerson }) => (firstPerson ? `border-radius: 1rem 1rem 0 0;` : "")}

  ${({ lastPerson }) => (lastPerson ? `border-radius: 0 0 1rem 1rem;` : "")}

${({ lastPerson, onlyPerson }) =>
    lastPerson || onlyPerson
      ? `border-bottom: 0;`
      : `border-bottom: 0.1rem solid #464646;`}

  ${({ onlyPerson }) => (onlyPerson ? `border-radius: 1rem;` : "")}

  ${({ isYou }) => (isYou ? `background: #353434;` : "")}

  ${({ isTalking }) =>
    `border-bottom: 0.5rem solid ${isTalking ? "#7be27b;" : "#353434;"}`}

  ${({ isTalking }) =>
    isTalking
      ? `
  border-top: 0.1rem solid #7be27b;
  border-bottom: 0.1rem solid #7be27b;
  border-right: 0.1rem solid #7be27b;
  `
      : ""}
`;

const OnlineIndicator = styled.div<TIndicatorProps>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 5rem;
  margin-right: 1rem;
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
        {participants.map((p, i) => (
          <User
            key={p.sessionid}
            firstPerson={i === 0 && i !== participants.length - 1}
            lastPerson={i !== 0 && i === participants.length - 1}
            onlyPerson={i === 0 && i === participants.length - 1}
            isYou={p.sessionid === sessionid}
            isTalking={
              audioLevelAboveThreshold && p.endpointid === dominantSpeaker
            }
          >
            <OnlineIndicator isActive={p.isActive}>
              <IconWrapper>
                <UserIcon />
              </IconWrapper>
            </OnlineIndicator>
            {p.name} {p.isActive ? "" : "(inactive)"}
          </User>
        ))}
      </ListWrapper>
    </Container>
  );
};
