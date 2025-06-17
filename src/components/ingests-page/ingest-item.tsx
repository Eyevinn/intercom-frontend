import { useEffect, useState } from "react";
import { TSavedIngest } from "../../api/api";

import { CollapsibleItem } from "../shared/collapsible-item";
import { EditNameForm } from "../shared/edit-name-form";
import { HeaderText, StatusDot, HeaderWrapper } from "./ingest-components";
import { ExpandedContent } from "./expanded-content";
import { useHandleHeaderClick } from "../shared/use-handle-header-click";
import { useDeleteIngest } from "./use-delete-ingest";

type IngestItemProps = {
  ingest: TSavedIngest;
  refresh: () => void;
};

export const IngestItem = ({ ingest, refresh }: IngestItemProps) => {
  const [editNameOpen, setEditNameOpen] = useState<boolean>(false);
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);
  const [removeIngestId, setRemoveIngestId] = useState<string | null>(null);

  const { loading: deleteIngestLoading, success: successfullDeleteIngest } =
    useDeleteIngest(removeIngestId);

  const handleHeaderClick = useHandleHeaderClick(editNameOpen);

  useEffect(() => {
    if (successfullDeleteIngest) {
      setRemoveIngestId(null);
      setDisplayConfirmationModal(false);
      refresh();
    }
  }, [successfullDeleteIngest, refresh]);

  const headerContent = (
    <HeaderWrapper>
      <EditNameForm
        item={ingest}
        formSubmitType="ingestName"
        managementMode
        setEditNameOpen={setEditNameOpen}
        renderLabel={(item) => (
          <HeaderText title={item.name}>
            {item.name.length > 40 ? `${item.name.slice(0, 40)}...` : item.name}
          </HeaderText>
        )}
        refresh={refresh}
      />
      <StatusDot isActive />
    </HeaderWrapper>
  );

  const expandedContent = (
    <ExpandedContent
      ingest={ingest}
      displayConfirmationModal={displayConfirmationModal}
      deleteIngestLoading={deleteIngestLoading}
      setDisplayConfirmationModal={setDisplayConfirmationModal}
      setEditNameOpen={setEditNameOpen}
      setRemoveIngestId={setRemoveIngestId}
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
