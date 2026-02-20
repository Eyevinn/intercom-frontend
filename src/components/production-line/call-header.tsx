import styled from "@emotion/styled";
import { useMemo } from "react";
import {
  UsersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TVIcon,
  WhipIcon,
} from "../../assets/icons/icon";
import {
  ParticipantCount,
  ParticipantCountWrapper,
  ProductionNameWrapper,
} from "../production-list/production-list-components";
import { HeaderTexts } from "../shared/shared-components";
import { AudioFeedIcon, CallHeader } from "./production-line-components";
import { TLine } from "./types";
import { TBasicProductionResponse } from "../../api/api";
import { KebabMenu } from "./kebab-menu";

const CallHeaderTexts = styled(HeaderTexts)`
  justify-content: flex-start;
  gap: 0.5rem;
  overflow: visible;
`;

const CallProductionNameWrapper = styled(ProductionNameWrapper)`
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const CallNameRow = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  font-size: 1.4rem;
  font-weight: bold;
`;

const CallProductionNameText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
`;

const CallLineNameText = styled.span`
  white-space: nowrap;
  flex-shrink: 0;
`;

const HeaderActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
`;

const ChevronButton = styled.div`
  display: flex;
  align-items: center;
  height: 3rem;
  width: 3rem;
  flex-shrink: 0;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(89, 203, 232, 0.1);
    color: #59cbe8;
  }

  svg {
    transform: translateY(1.5px);
  }
`;

export const CallHeaderComponent = ({
  open,
  line,
  production,
  setOpen,
  showHotkeys,
  onOpenHotkeys,
}: {
  open: boolean;
  line: TLine | null;
  production: TBasicProductionResponse | null;
  setOpen: () => void;
  showHotkeys?: boolean;
  onOpenHotkeys?: () => void;
}) => {
  const totalUsers = useMemo(() => {
    return line?.participants.filter((p) => !p.isWhip).length || 0;
  }, [line]);

  const totalWhipSessions = useMemo(() => {
    return line?.participants.filter((p) => p.isWhip).length || 0;
  }, [line]);

  return (
    <CallHeader open={open} onClick={setOpen}>
      <CallHeaderTexts
        open={open}
        isProgramOutputLine={line?.programOutputLine || false}
        className={(line?.participants.length || 0) > 0 ? "active" : ""}
      >
        {!open && line?.programOutputLine && (
          <AudioFeedIcon open={false}>
            <TVIcon />
          </AudioFeedIcon>
        )}
        <CallProductionNameWrapper>
          <CallNameRow title={`${production?.name} / ${line?.name}`}>
            <CallProductionNameText>{production?.name}</CallProductionNameText>
            <CallLineNameText>{`\u00A0/ ${line?.name}`}</CallLineNameText>
          </CallNameRow>
        </CallProductionNameWrapper>

        <HeaderActionsRow>
          {production && line && (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              <KebabMenu
                productionId={production.productionId}
                lineId={line.id}
                production={production}
                line={line}
                showHotkeys={showHotkeys}
                onOpenHotkeys={onOpenHotkeys}
              />
            </div>
          )}
          {totalWhipSessions > 0 && (
            <ParticipantCountWrapper
              className={totalWhipSessions > 0 ? "whip" : ""}
            >
              <WhipIcon />
              <ParticipantCount>{totalWhipSessions}</ParticipantCount>
            </ParticipantCountWrapper>
          )}
          <ParticipantCountWrapper className={totalUsers > 0 ? "active" : ""}>
            <UsersIcon />
            <ParticipantCount>{totalUsers}</ParticipantCount>
          </ParticipantCountWrapper>
        </HeaderActionsRow>
        <ChevronButton>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </ChevronButton>
      </CallHeaderTexts>
      {line?.programOutputLine && open && (
        <AudioFeedIcon open={open}>
          <TVIcon />
          Audio feed
        </AudioFeedIcon>
      )}
    </CallHeader>
  );
};
