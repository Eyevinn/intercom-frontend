import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";
import {
  UsersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TVIcon,
  WhipIcon,
  ShareIcon,
} from "../../assets/icons/icon";
import {
  ParticipantCount,
  ParticipantCountWrapper,
  ProductionNameWrapper,
} from "../production-list/production-list-components";
import { HeaderTexts } from "../shared/shared-components";
import { mediaQueries } from "../generic-components";
import { AudioFeedIcon, CallHeader } from "./production-line-components";
import { TLine } from "./types";
import { TBasicProductionResponse } from "../../api/api";
import { KebabMenu } from "./kebab-menu";
import { useShareUrl } from "../../hooks/use-share-url";
import { ShareLineLinkModal } from "../generate-urls/share-line-link/share-line-link-modal";

const CallHeaderTexts = styled(HeaderTexts)`
  justify-content: flex-start;
  gap: 0.5rem;
  flex: 1 1 0%;
  min-width: 0;
  width: auto;
`;

const CallProductionNameWrapper = styled(ProductionNameWrapper)`
  flex: 0 1 auto;
  min-width: 0;
  max-width: none;
  overflow: hidden;
`;

const CallNameRow = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  font-size: 1.4rem;
  font-weight: bold;
`;

const CallProductionNamePrefix = styled.span`
  display: flex;
  overflow: hidden;
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
`;

const CallProductionNameText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CallLineNameText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  min-width: 0;
  max-width: 100%;
`;

const HeaderActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
`;

const DesktopOnly = styled.div`
  display: contents;

  ${mediaQueries.isSmallScreen} {
    display: none;
  }
`;

const MobileOnly = styled.div`
  display: none;

  ${mediaQueries.isSmallScreen} {
    display: contents;
  }
`;

const ShareButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(89, 203, 232, 0.1);
  }

  svg {
    width: 2rem;
    height: 2rem;
    fill: #59cbe8;
  }
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { shareUrl, url } = useShareUrl();

  const totalUsers = useMemo(() => {
    return line?.participants.filter((p) => !p.isWhip).length || 0;
  }, [line]);

  const totalWhipSessions = useMemo(() => {
    return line?.participants.filter((p) => p.isWhip).length || 0;
  }, [line]);

  const handleShareClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (production && line) {
        shareUrl({
          productionId: production.productionId,
          lineId: line.id,
        });
      }
      setShareModalOpen(true);
    },
    [production, line, shareUrl]
  );

  const handleShareRefresh = useCallback(() => {
    if (production && line) {
      shareUrl({
        productionId: production.productionId,
        lineId: line.id,
      });
    }
  }, [production, line, shareUrl]);

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
            <CallProductionNamePrefix>
              <CallProductionNameText>
                {production?.name}
              </CallProductionNameText>
              {`\u00A0/\u00A0`}
            </CallProductionNamePrefix>
            <CallLineNameText>{line?.name}</CallLineNameText>
          </CallNameRow>
        </CallProductionNameWrapper>
      </CallHeaderTexts>
      <HeaderActionsRow>
        {production && line && (
          <>
            <DesktopOnly>
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
            </DesktopOnly>
            <MobileOnly>
              <ShareButton title="Share line link" onClick={handleShareClick}>
                <ShareIcon />
              </ShareButton>
            </MobileOnly>
          </>
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
      {line?.programOutputLine && open && (
        <AudioFeedIcon open={open}>
          <TVIcon />
          Audio feed
        </AudioFeedIcon>
      )}
      {shareModalOpen && (
        <ShareLineLinkModal
          urls={[url]}
          onRefresh={handleShareRefresh}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </CallHeader>
  );
};
