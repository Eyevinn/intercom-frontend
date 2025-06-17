import { API, TEditIngest } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

export const useEditIngest = (params: TEditIngest | null) => {
  return useRequest<TEditIngest, TEditIngest>({
    params,
    apiCall: API.updateIngest,
    errorMessage: (i) =>
      `Failed to edit ingest: ${i.name} ${i.deviceOutput?.label} ${i.deviceInput?.label}`,
  });
};
