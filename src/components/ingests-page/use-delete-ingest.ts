import { API } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

export const useDeleteIngest = (id: string | null) => {
  return useRequest<string, string>({
    params: id,
    apiCall: API.deleteIngest,
    errorMessage: () => "Failed to delete ingest",
  });
};
