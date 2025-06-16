import { useEffect, useState } from "react";
import { PageHeader } from "../page-layout/page-header";
import { useGlobalState } from "../../global-state/context-provider";
import { SecondaryButton } from "../form-elements/form-elements";
import { IngestItem } from "./ingest-item";
import { LocalError } from "../error";
import { Modal } from "../modal/modal";
import { IngestFormModal } from "./add-ingest-modal/ingest-form";
import { ListWrapper } from "./ingest-components";
import { mockedIngestData, mockedError } from "./mocked-data";

export const IngestsPage = ({ setApiError }: { setApiError: () => void }) => {
  const [showAddIngestModal, setShowAddIngestModal] = useState<boolean>(false);
  const [{ apiError }] = useGlobalState();

  // TODO: fetch ingests when endpoint is ready

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
      {!!mockedIngestData?.length && (
        <ListWrapper>
          {mockedError && <LocalError error={mockedError} />}
          {!mockedError &&
            mockedIngestData &&
            mockedIngestData.map((i) => <IngestItem key={i.id} ingest={i} />)}
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
