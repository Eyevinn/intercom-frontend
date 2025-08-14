import { useState } from "react";
import { TIngest } from "../../api/api";

import { CollapsibleItem } from "../shared/collapsible-item";
import { EditNameForm } from "../shared/edit-name-form";
import { HeaderText, StatusDot, HeaderWrapper } from "./ingest-components";
import { IngestExpandedContent } from "./ingest-expanded-content";
import { useHandleHeaderClick } from "../shared/use-handle-header-click";

type IngestItemProps = {
  ingest: TIngest;
  refresh: () => void;
};

export const IngestItem = ({ ingest, refresh }: IngestItemProps) => {
  const [editNameOpen, setEditNameOpen] = useState<boolean>(false);

  const handleHeaderClick = useHandleHeaderClick(editNameOpen);

  const headerContent = (
    <HeaderWrapper>
      <EditNameForm
        item={ingest}
        formSubmitType="ingestLabel"
        managementMode
        setEditNameOpen={setEditNameOpen}
        renderLabel={() => (
          <HeaderText title={ingest.label || ""}>
            {ingest.label && ingest.label.length > 40
              ? `${ingest.label.slice(0, 40)}...`
              : ingest.label}
          </HeaderText>
        )}
        refresh={refresh}
      />
      <StatusDot isActive />
    </HeaderWrapper>
  );

  const expandedContent = (
    <IngestExpandedContent
      ingest={ingest}
      setEditNameOpen={setEditNameOpen}
      refresh={refresh}
    />
  );

  return (
    <CollapsibleItem
      headerContent={headerContent}
      expandedContent={expandedContent}
      onHeaderClick={handleHeaderClick}
    />
  );
};
