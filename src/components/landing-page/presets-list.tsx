import { useState } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { usePresets } from "../../hooks/use-presets";
import { buildCallsUrl } from "../../utils/call-url";
import { TBasicProductionResponse, TPreset } from "../../api/api";
import { CollapsibleItem } from "../shared/collapsible-item";
import { PageHeader } from "../page-layout/page-header";
import { ShareIcon, UsersIcon } from "../../assets/icons/icon";
import { CopyIconWrapper } from "../copy-button/copy-components";
import { SecondaryButton } from "../form-elements/form-elements";
import {
  Lineblock,
  ParticipantCount,
  ParticipantCountWrapper,
} from "../production-list/production-list-components";

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

const CopiedTooltip = styled.span`
  font-size: 1.2rem;
  color: #91fa8c;
  margin-right: 0.5rem;
  white-space: nowrap;
`;

const CallEntryList = styled.ul`
  list-style: none;
  margin: 0 0 1.5rem;
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
  const [copied, setCopied] = useState(false);
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
    const url = window.location.origin + buildCallsUrl(preset.calls);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(buildCallsUrl(preset.calls));
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
      {copied && <CopiedTooltip>Copied!</CopiedTooltip>}
      <CopyIconWrapper
        title="Copy preset URL"
        onClick={handleShare}
        className="production-list-item"
        isCopied={copied}
      >
        <ShareIcon />
      </CopyIconWrapper>
      <Spacer />
      <JoinButton type="button" onClick={handleJoin}>
        Join
      </JoinButton>
    </>
  );

  const expandedContent = (
    <CallEntryList>
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
    </CallEntryList>
  );

  return (
    <CollapsibleItem
      headerContent={headerContent}
      expandedContent={expandedContent}
      // eslint-disable-next-line no-underscore-dangle
      testId={`preset-${preset._id}`}
    />
  );
};

type PresetsListProps = {
  productions: TBasicProductionResponse[];
};

export const PresetsList = ({ productions }: PresetsListProps) => {
  const { presets, loading } = usePresets();

  if (loading || presets.length === 0) return null;

  return (
    <>
      <PageHeader title="Presets" />
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
