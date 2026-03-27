import { useState } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { usePresetContext } from "../../contexts/preset-context";
import { buildCallsUrl } from "../../utils/call-url";
import { TBasicProductionResponse, TPreset } from "../../api/api";
import { CollapsibleItem } from "../shared/collapsible-item";
import { InfoTooltip } from "../info-tooltip/info-tooltip";
import { PageHeader } from "../page-layout/page-header";
import { ShareIcon, UsersIcon } from "../../assets/icons/icon";
import { CopyIconWrapper } from "../copy-button/copy-components";
import { SecondaryButton } from "../form-elements/form-elements";
import { ShareUrlModal } from "../share-url-modal/share-url-modal";
import {
  Lineblock,
  ParticipantCount,
  ParticipantCountWrapper,
} from "../production-list/production-list-components";

const CompanionRow = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0;
`;

const CompanionLabel = styled.span`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
`;

const EmptyPresetText = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.45);
  font-style: italic;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  span {
    font-style: normal;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0 0 2rem;
  align-items: flex-start;
`;

const PresetName = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 0.5rem;
`;

const Spacer = styled.span`
  flex: 1;
`;

const JoinButton = styled(SecondaryButton)`
  flex-shrink: 0;
  margin-right: 0.5rem;
`;

const LocalBadge = styled.span`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.3rem;
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CompanionBadge = styled(LocalBadge)``;

const CallEntryList = styled.ul<{ hasCompanion?: boolean }>`
  list-style: none;
  margin: 0 0 ${({ hasCompanion }) => (hasCompanion ? "0.8rem" : "1.5rem")};
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const LineName = styled.div`
  font-weight: bold;
  font-size: 1.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ProductionSubtext = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 0.2rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const LineNameWrapper = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

type PresetCardProps = {
  preset: TPreset;
  productions: TBasicProductionResponse[];
};

const PresetCard = ({ preset, productions }: PresetCardProps) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const navigate = useNavigate();

  const resolveCall = (call: { productionId: string; lineId: string }) => {
    const production = productions.find(
      (p) => p.productionId === call.productionId
    );
    const line = production?.lines.find((l) => l.id === call.lineId);
    return { production, line };
  };

  const totalParticipants = preset.calls.reduce((sum, call) => {
    const { line } = resolveCall(call);
    return sum + (line?.participants.filter((p) => !p.isWhip).length ?? 0);
  }, 0);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalOpen(true);
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(buildCallsUrl(preset.calls, preset.companionUrl));
  };

  const headerContent = (
    <>
      <PresetName title={preset.name}>{preset.name}</PresetName>
      <ParticipantCountWrapper
        className={totalParticipants > 0 ? "active" : ""}
      >
        <UsersIcon />
        <ParticipantCount>{totalParticipants}</ParticipantCount>
      </ParticipantCountWrapper>
      {preset.calls.length > 0 && (
        <CopyIconWrapper
          title="Share saved configuration URL"
          onClick={handleShare}
          className="production-list-item"
          isCopied={false}
        >
          <ShareIcon />
        </CopyIconWrapper>
      )}
      {preset.isLocal && <LocalBadge>Local</LocalBadge>}
      {preset.companionUrl && <CompanionBadge>Companion</CompanionBadge>}
      <Spacer />
      <JoinButton
        type="button"
        onClick={handleJoin}
        style={{ visibility: preset.calls.length === 0 ? "hidden" : "visible" }}
      >
        Join
      </JoinButton>
    </>
  );

  const expandedContent = (
    <CallEntryList hasCompanion={!!preset.companionUrl}>
      {preset.calls.length === 0 && (
        <li>
          <EmptyPresetText>
            No lines in this saved configuration
            <InfoTooltip>
              Lines may have been deleted. You can add new lines from the Manage
              page or delete this saved configuration.
            </InfoTooltip>
          </EmptyPresetText>
        </li>
      )}
      {preset.calls.map((call, idx) => {
        const { production, line } = resolveCall(call);
        const lineName = line
          ? line.name
          : `Production ${call.productionId} / Line ${call.lineId}`;
        const productionName = production?.name ?? null;
        const participantCount =
          line?.participants.filter((p) => !p.isWhip).length ?? 0;

        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${call.productionId}-${call.lineId}-${idx}`}>
            <Lineblock>
              <LineNameWrapper>
                <LineName>{lineName}</LineName>
                {productionName && (
                  <ProductionSubtext>{productionName}</ProductionSubtext>
                )}
              </LineNameWrapper>
              <ParticipantCountWrapper
                className={participantCount > 0 ? "active" : ""}
              >
                <UsersIcon />
                <ParticipantCount>{participantCount}</ParticipantCount>
              </ParticipantCountWrapper>
            </Lineblock>
          </li>
        );
      })}
      {preset.companionUrl && (
        <CompanionRow>
          <CompanionLabel>Companion</CompanionLabel>
          {preset.companionUrl}
        </CompanionRow>
      )}
    </CallEntryList>
  );

  return (
    <>
      <CollapsibleItem
        headerContent={headerContent}
        expandedContent={expandedContent}
        // eslint-disable-next-line no-underscore-dangle
        testId={`preset-${preset._id}`}
      />
      {shareModalOpen && (
        <ShareUrlModal
          path={buildCallsUrl(preset.calls)}
          companionUrl={preset.companionUrl}
          title="Share Saved Configuration"
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </>
  );
};

type PresetListProps = {
  productions: TBasicProductionResponse[];
};

export const PresetList = ({ productions }: PresetListProps) => {
  const { presets, loading } = usePresetContext();

  if (loading || presets.length === 0) return null;

  return (
    <>
      <PageHeader
        title="Saved Configurations"
        titleAdornment={
          <InfoTooltip>
            A <strong>saved configuration</strong> is a saved combination of
            lines you can join with one click. Attach a{" "}
            <strong>companion URL</strong> to automatically open a companion
            connection when the configuration is opened. Deleting a line removes
            it from any saved configurations it belongs to.
          </InfoTooltip>
        }
      />
      <ListWrapper>
        {presets.map((preset) => (
          <PresetCard
            // eslint-disable-next-line no-underscore-dangle
            key={preset._id}
            preset={preset}
            productions={productions}
          />
        ))}
      </ListWrapper>
    </>
  );
};
