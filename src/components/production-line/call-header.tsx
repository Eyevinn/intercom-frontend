import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import {
  UsersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TVIcon,
  WhipIcon,
  ShareIcon,
} from "../../assets/icons/icon";
import {
  ProductionName,
  ParticipantCount,
  ParticipantCountWrapper,
  ProductionNameWrapper,
  IconWrapper,
} from "../production-list/production-list-components";
import { HeaderTexts, HeaderIcon } from "../shared/shared-components";
import { AudioFeedIcon, CallHeader } from "./production-line-components";
import { TLine, TProduction } from "./types";
import { useShareUrl } from "../../hooks/use-share-url";
import { ShareLineLinkModal } from "../generate-urls/share-line-link/share-line-link-modal";

const ShareHeaderButton = styled.button`
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  svg {
    width: 100%;
    height: 100%;
  }
`;

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

  const { shareUrl, url } = useShareUrl();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleShareClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (!production || !line) return;
    await shareUrl({ productionId: production.productionId, lineId: line.id });
    setIsShareOpen(true);
  };

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
          <IconWrapper>
            <ShareHeaderButton
              type="button"
              aria-label="Share line link"
              onClick={handleShareClick}
            >
              <ShareIcon />
            </ShareHeaderButton>
          </IconWrapper>
        </ProductionNameWrapper>

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
      {isShareOpen && production && line && (
        <ShareLineLinkModal
          urls={[url]}
          onRefresh={() =>
            shareUrl({ productionId: production.productionId, lineId: line.id })
          }
          onClose={() => setIsShareOpen(false)}
        />
      )}
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
