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
} from "../production-list/production-list-components";
import { HeaderTexts, HeaderIcon } from "../shared/shared-components";
import { AudioFeedIcon, CallHeader } from "./production-line-components";
import { TLine, TProduction } from "./types";

export const CallHeaderComponent = ({
  open,
  line,
  production,
  setOpen,
}: {
  open: boolean;
  line: TLine | null;
  production: TProduction | null;
  setOpen: () => void;
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
        <ProductionName title={`${production?.name} / ${line?.name}`}>
          <span className="production-name-container">
            {`${truncatedProductionName}/ ${truncatedLineName}`}
          </span>
        </ProductionName>
        <div>
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
        </div>
      </HeaderTexts>
      {line?.programOutputLine && open && (
        <AudioFeedIcon open={open}>
          <TVIcon />
          Audio feed
        </AudioFeedIcon>
      )}
      <HeaderIcon>{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</HeaderIcon>
    </CallHeader>
  );
};
