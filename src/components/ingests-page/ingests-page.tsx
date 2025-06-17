import { useEffect, useState } from "react";
import { PageHeader } from "../page-layout/page-header";
import { useGlobalState } from "../../global-state/context-provider";
import { SecondaryButton } from "../form-elements/form-elements";
import { IngestItem } from "./ingest-item";
import { LocalError } from "../error";
import { Modal } from "../modal/modal";
import { IngestFormModal } from "./add-ingest-modal/ingest-form";
import { ListWrapper } from "./ingest-components";
// TODO: remove this, but keep for now for testing because real outputs/inputs are not yet implemented
// import { mockedIngestData, mockedError } from "./mocked-data";
import { useListIngest } from "./use-list-ingests";

export const IngestsPage = ({ setApiError }: { setApiError: () => void }) => {
  const [showAddIngestModal, setShowAddIngestModal] = useState<boolean>(false);
  const [{ apiError }] = useGlobalState();

  const { ingests, error, setIntervalLoad, refresh } = useListIngest();

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIntervalLoad(true);
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [setIntervalLoad]);

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
            ingests.map((i) => (
              <IngestItem key={i._id} ingest={i} refresh={refresh} />
            ))}
          {/* TODO: remove this, but keep for now for testing because real outputs/inputs are not yet implemented */}
          {/*  {mockedError && <LocalError error={mockedError} />}
          {!mockedError &&
            mockedIngestData &&
            mockedIngestData.map((i) => (
              <IngestItem key={i._id} ingest={i} refresh={refresh} />
            ))} */}
        </ListWrapper>
      )}
      {showAddIngestModal && (
        <Modal onClose={() => setShowAddIngestModal(false)}>
          <IngestFormModal
            onSave={() => {
              setShowAddIngestModal(false);
              refresh();
            }}
          />
        </Modal>
      )}
    </>
  );
};
