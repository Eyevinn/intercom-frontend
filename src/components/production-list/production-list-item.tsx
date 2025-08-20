import { useMemo, useState } from "react";
import { TBasicProductionResponse } from "../../api/api";
import { UsersIcon, WhipIcon } from "../../assets/icons/icon";
import { TLine } from "../production-line/types";
import {
  ParticipantCount,
  ParticipantCountWrapper,
} from "./production-list-components";
import { EditNameForm } from "../shared/edit-name-form";
import { CollapsibleItem } from "../shared/collapsible-item";
import { LabelField } from "./labelField";
import { ProductionListExpandedContent } from "./production-list-expanded-content";
import { useHandleHeaderClick } from "../shared/use-handle-header-click";

type ProductionsListItemProps = {
  production: TBasicProductionResponse;
  managementMode?: boolean;
};

export const ProductionsListItem = ({
  production,
  managementMode = false,
}: ProductionsListItemProps) => {
  const [editNameOpen, setEditNameOpen] = useState<boolean>(false);

  const handleHeaderClick = useHandleHeaderClick(editNameOpen);

  const totalUsers = useMemo(() => {
    return (
      production.lines
        ?.map((line) => line.participants.filter((p) => !p.isWhip).length || 0)
        .reduce((partialSum, a) => partialSum + a, 0) || 0
    );
  }, [production]);

  const totalWhipSessions = useMemo(() => {
    return (
      production.lines
        ?.map((line) => line.participants.filter((p) => p.isWhip).length || 0)
        .reduce((partialSum, a) => partialSum + a, 0) || 0
    );
  }, [production]);

  const headerContent = (
    <>
      <EditNameForm
        item={production}
        formSubmitType="productionName"
        managementMode={managementMode}
        setEditNameOpen={setEditNameOpen}
        renderLabel={(item, line, mode) => (
          <LabelField
            isLabelProductionName
            production={item as TBasicProductionResponse}
            line={line ?? ({} as TLine)}
            managementMode={mode ?? false}
          />
        )}
      />
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
    </>
  );

  const expandedContent = (
    <ProductionListExpandedContent
      production={production}
      managementMode={managementMode}
      totalParticipants={totalUsers}
    />
  );

  return (
    <CollapsibleItem
      headerContent={headerContent}
      expandedContent={expandedContent}
      onHeaderClick={handleHeaderClick}
      className={totalUsers > 0 ? "active" : ""}
    />
  );
};
