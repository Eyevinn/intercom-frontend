import { useEffect, useState } from "react";
import { PageHeader } from "../page-layout/page-header";
import { useGlobalState } from "../../global-state/context-provider";
import { SecondaryButton } from "../form-elements/form-elements";
import { IngestItem } from "./ingest-item";
import { LocalError } from "../error";
import { Modal } from "../modal/modal";
import { IngestFormModal } from "./add-ingest-modal/ingest-form";
import { ListWrapper } from "./ingest-components";

export const IngestsPage = ({ setApiError }: { setApiError: () => void }) => {
  const [showAddIngestModal, setShowAddIngestModal] = useState<boolean>(false);
  const [{ apiError }] = useGlobalState();

  // TODO: fetch ingests when endpoint is ready
  const ingests = [
    {
      id: "1",
      name: "Ingest 1",
      ipAddress: "192.168.1.1",
      deviceOutput: [
        { name: "Output 1", label: "Output 1" },
        { name: "Output 2", label: "Output 2" },
        { name: "Output 3", label: "Output 3" },
      ],
      deviceInput: [
        { name: "Input 1", label: "Input 1" },
        { name: "Input 2", label: "Input 2" },
        { name: "Input 3", label: "Input 3" },
      ],
    },
    {
      id: "2",
      name: "Ingest 2",
      ipAddress: "192.168.1.2",
      deviceOutput: [
        { name: "Output 1", label: "Output 1" },
        { name: "Output 2", label: "Output 2" },
        { name: "Output 3", label: "Output 3" },
      ],
      deviceInput: [
        { name: "Input 1", label: "Input 1" },
        { name: "Input 2", label: "Input 2" },
        { name: "Input 3", label: "Input 3" },
      ],
    },
  ];
  const error = null;

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  return (
    <>
      <PageHeader title="Ingests" hasNavigateToRoot>
        <SecondaryButton
          type="button"
          onClick={() => setShowAddIngestModal(true)}
        >
          Add Ingest
        </SecondaryButton>
      </PageHeader>
      {!!ingests?.length && (
        <ListWrapper>
          {error && <LocalError error={error} />}
          {!error &&
            ingests &&
            ingests.map((i) => <IngestItem key={i.id} ingest={i} />)}
        </ListWrapper>
      )}
      {showAddIngestModal && (
        <Modal onClose={() => setShowAddIngestModal(false)}>
          <IngestFormModal onSave={() => setShowAddIngestModal(false)} />
        </Modal>
      )}
    </>
  );
};
