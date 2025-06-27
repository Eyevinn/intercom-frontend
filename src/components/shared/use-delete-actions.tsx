import { useState, useEffect } from "react";
import { useDeleteIngest } from "../ingests-page/use-delete-ingest";

type DeleteActions = {
  deleteIngest: (ingestId: string) => void;
  isDeleting: boolean;
  isSuccess: boolean;
  refresh?: () => void;
};

export const useDeleteActions = ({
  refresh,
}: {
  refresh?: () => void;
}): DeleteActions => {
  const [deleteIngestId, setDeleteIngestId] = useState<string | null>(null);

  const { loading: deleteIngestLoading, success: deleteIngestSuccess } =
    useDeleteIngest(deleteIngestId);

  // Auto-refresh and cleanup on successful delete
  useEffect(() => {
    if (deleteIngestSuccess && deleteIngestId) {
      setDeleteIngestId(null);
      refresh?.();
    }
  }, [deleteIngestSuccess, deleteIngestId, refresh]);

  const deleteIngest = (ingestId: string) => {
    setDeleteIngestId(ingestId);
  };

  return {
    deleteIngest,
    isDeleting: deleteIngestLoading,
    isSuccess: deleteIngestSuccess,
  };
};
