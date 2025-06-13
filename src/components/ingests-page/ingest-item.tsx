import { useEffect, useState } from "react";
import { TSavedIngestResponse } from "../../api/api";

import { CollapsibleItem } from "../shared/collapsible-item";
import { EditNameForm } from "../shared/edit-name-form";
import { HeaderText, StatusDot, HeaderWrapper } from "./ingest-components";
import { ExpandedContent } from "./expanded-content";

type IngestItemProps = {
  ingest: TSavedIngestResponse;
};

export const IngestItem = ({ ingest }: IngestItemProps) => {
  const [editNameOpen, setEditNameOpen] = useState<boolean>(false);
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);
  const [removeIngestId, setRemoveIngestId] = useState<string | null>(null);
  // TODO: remove this dummy state when delete ingest success state is added
  const [successfullDeleteIngest, setSuccessfullDeleteIngest] =
    useState<boolean>(false);

  useEffect(() => {
    if (removeIngestId) {
      // TODO: add delete ingest function and add success state
      setSuccessfullDeleteIngest(true);
    }
  }, [removeIngestId]);

  useEffect(() => {
    if (successfullDeleteIngest) {
      setRemoveIngestId(null);
      setSuccessfullDeleteIngest(false);
      setDisplayConfirmationModal(false);
    }
  }, [successfullDeleteIngest]);

  const handleHeaderClick = (
    e: React.MouseEvent,
    open: boolean,
    setOpen: (open: boolean) => void
  ) => {
    if (
      !editNameOpen &&
      !(e.target as HTMLElement).closest(".name-edit-button")
    ) {
      setOpen(!open);
    }
  };

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
      />
      <StatusDot isActive />
    </HeaderWrapper>
  );

  const expandedContent = (
    <ExpandedContent
      ingest={ingest}
      displayConfirmationModal={displayConfirmationModal}
      setDisplayConfirmationModal={setDisplayConfirmationModal}
      setEditNameOpen={setEditNameOpen}
      setRemoveIngestId={setRemoveIngestId}
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
