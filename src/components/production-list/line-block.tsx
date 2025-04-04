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
} from "../../assets/icons/icon";

import { isMobile } from "../../bowser";
import { TLine } from "../production-line/types";
import { CopyButton } from "../copy-button/copy-button";
import { TBasicProductionResponse } from "../../api/api";

export const LineBlock = ({
  managementMode,
  line,
  production,
}: {
  managementMode: boolean;
  line: TLine;
  production: TBasicProductionResponse;
}) => {
  const [showFullUserList, setShowFullUserList] = useState<boolean>(false);
  return (
    <LineBlockTexts>
      <LineBlockTitleWrapper>
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
        {managementMode && (
          <CopyButton
            url={`${window.location.origin}/production-calls/production/${production.productionId}/line/${line.id}`}
            className="production-list-item"
          />
        )}
      </LineBlockTitleWrapper>
      <LineBlockParticipants>
        {(showFullUserList
          ? line.participants
          : line.participants.slice(0, 4)
        ).map((participant) => (
          <LineBlockParticipant key={`participant-${participant.sessionId}`}>
            <UserIcon />
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
