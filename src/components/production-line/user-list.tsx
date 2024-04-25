import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { TParticipant } from "./types.ts";

const ListWrapper = styled.div``;

type TUserProps = {
  isYou: boolean;
  isActive: boolean;
  isTalking: boolean;
};

const User = styled.div<TUserProps>`
  margin: 0 0 1rem;
  background: #1a1a1a;
  padding: 1rem;
  color: #ddd;
  max-width: 32rem;
  border-radius: 0.5rem;
  border: 0.1rem solid #1a1a1a;

  ${({ isYou }) => (isYou ? `background: #353434;` : "")}

  ${({ isActive }) =>
    `border-left: 1rem solid ${isActive ? "#7be27b;" : "#ebca6a;"}`}

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
    <ListWrapper>
      <DisplayContainerHeader>Participants</DisplayContainerHeader>
      {participants.map((p) => (
        <User
          key={p.sessionid}
          isYou={p.sessionid === sessionid}
          isActive={p.isActive}
          isTalking={
            audioLevelAboveThreshold && p.endpointid === dominantSpeaker
          }
        >
          {p.name} {p.isActive ? "" : "(inactive)"}
        </User>
      ))}
    </ListWrapper>
  );
};
