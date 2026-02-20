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
  ProductionName,
  ParticipantCount,
  ParticipantCountWrapper,
  ProductionNameWrapper,
} from "../production-list/production-list-components";
import { HeaderTexts } from "../shared/shared-components";
import { AudioFeedIcon, CallHeader } from "./production-line-components";
import { TLine } from "./types";
import { TBasicProductionResponse } from "../../api/api";
import { KebabMenu } from "./kebab-menu";

const HeaderActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
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
  const truncatedProductionName =
    production && production.name.length > 20
      ? `${production.name.slice(0, 20)}...`
      : production?.name;

  const truncatedLineName =
    line && line.name.length > 40 ? `${line.name.slice(0, 40)}...` : line?.name;

  const totalUsers = useMemo(() => {
    return line?.participants.filter((p) => !p.isWhip).length || 0;
  }, [line]);

  const totalWhipSessions = useMemo(() => {
    return line?.participants.filter((p) => p.isWhip).length || 0;
  }, [line]);

  return (
    <CallHeader open={open} onClick={setOpen}>
      <HeaderTexts
        open={open}
        isProgramOutputLine={line?.programOutputLine || false}
        className={(line?.participants.length || 0) > 0 ? "active" : ""}
      >
        {!open && line?.programOutputLine && (
          <AudioFeedIcon open={false}>
            <TVIcon />
          </AudioFeedIcon>
        )}
        <ProductionNameWrapper>
          <ProductionName title={`${production?.name} / ${line?.name}`}>
            <span className="production-name-container">
              {`${truncatedProductionName}/ ${truncatedLineName}`}
            </span>
          </ProductionName>
        </ProductionNameWrapper>

        <HeaderActionsRow>
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
          {production && line && (
            <div
              onClick={(e) => e.stopPropagation()}
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
          <ChevronButton>
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </ChevronButton>
        </HeaderActionsRow>
      </HeaderTexts>
      {line?.programOutputLine && open && (
        <AudioFeedIcon open={open}>
          <TVIcon />
          Audio feed
        </AudioFeedIcon>
      )}
    </CallHeader>
  );
};
