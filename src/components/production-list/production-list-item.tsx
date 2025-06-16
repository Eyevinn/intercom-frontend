import { useMemo, useState } from "react";
import { TBasicProductionResponse } from "../../api/api";
import { UsersIcon } from "../../assets/icons/icon";
import {
  ParticipantCount,
  ParticipantCountWrapper,
} from "./production-list-components";
import { EditNameForm } from "../shared/edit-name-form";
import { CollapsibleItem } from "../shared/collapsible-item";
import { LabelField } from "./labelField";
import { ExpandedContent } from "./expanded-content";
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

  const totalParticipants = useMemo(() => {
    return (
      production.lines
        ?.map((line) => line.participants.length || 0)
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
        renderLabel={(item, line, mode) => {
          if (!line || !mode) return null;

          return (
            <LabelField
              isLabelProductionName
              production={item as TBasicProductionResponse}
              line={line}
              managementMode={mode}
            />
          );
        }}
      />
      <ParticipantCountWrapper
        className={totalParticipants > 0 ? "active" : ""}
      >
        <UsersIcon />
        <ParticipantCount>{totalParticipants}</ParticipantCount>
      </ParticipantCountWrapper>
    </>
  );

  const expandedContent = (
    <ExpandedContent
      production={production}
      managementMode={managementMode}
      totalParticipants={totalParticipants}
    />
  );

  return (
    <CollapsibleItem
      headerContent={headerContent}
      expandedContent={expandedContent}
      onHeaderClick={handleHeaderClick}
      className={totalParticipants > 0 ? "active" : ""}
    />
  );
};
