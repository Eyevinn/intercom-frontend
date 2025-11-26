import { API, TIngest } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

export const useEditIngest = (params: TIngest | null) => {
  return useRequest<TIngest, TIngest>({
    params,
    apiCall: API.updateIngest,
    errorMessage: (i) =>
      `Failed to edit ingest: ${i.label} ${i.deviceInput?.[0]?.label} ${i.deviceOutput?.[0]?.label}`,
  });
};
