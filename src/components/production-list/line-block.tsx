import { useState } from "react";
import {
  IconWrapper,
  LineBlockTitle,
  LineBlockTitleWrapper,
  ParticipantExpandBtn,
  PersonText,
  LineBlockParticipant,
  LineBlockParticipants,
  LineBlockTexts,
} from "./production-list-components";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  TVIcon,
  UserIcon,
  UsersIcon,
  WhipIcon,
} from "../../assets/icons/icon";

import { isMobile } from "../../bowser";
import { TLine } from "../production-line/types";

export const LineBlock = ({
  managementMode,
  line,
}: {
  managementMode: boolean;
  line: TLine;
}) => {
  const [showFullUserList, setShowFullUserList] = useState<boolean>(false);

  return (
    <LineBlockTexts>
      <LineBlockTitleWrapper className={managementMode ? "management" : ""}>
        {line.programOutputLine && (
          <IconWrapper>
            <TVIcon />
          </IconWrapper>
        )}
        <LineBlockTitle title={line.name}>
          {line.name.length > 40 ? `${line.name.slice(0, 40)}...` : line.name}
        </LineBlockTitle>
        {line.participants.length > 4 && (
          <ParticipantExpandBtn
            type="button"
            title={showFullUserList ? "Hide users" : "Show all users"}
            onClick={() => setShowFullUserList(!showFullUserList)}
          >
            <PersonText>
              {showFullUserList ? "hide" : "show"} {isMobile ? "" : "full list"}
            </PersonText>
            {showFullUserList ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </ParticipantExpandBtn>
        )}
      </LineBlockTitleWrapper>
      <LineBlockParticipants>
        {(showFullUserList
          ? line.participants
          : line.participants.slice(0, 4)
        ).map((participant) => (
          <LineBlockParticipant
            key={`participant-${participant.sessionId}`}
            className={participant.isWhip ? "whip" : ""}
          >
            {participant.isWhip ? <WhipIcon /> : <UserIcon />}
            <PersonText>{participant.name}</PersonText>
          </LineBlockParticipant>
        ))}
        {line.participants.length > 4 && !showFullUserList && (
          <LineBlockParticipant>
            <UsersIcon />
            <PersonText>{`+${line.participants.length - 4} other user${line.participants.length - 4 > 1 ? "s" : ""}`}</PersonText>
          </LineBlockParticipant>
        )}
      </LineBlockParticipants>
    </LineBlockTexts>
  );
};
