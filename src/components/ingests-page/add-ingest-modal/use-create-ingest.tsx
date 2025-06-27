import { API } from "../../../api/api";
import { useRequest } from "../../../hooks/use-request";
import { FormValues } from "../types";

export const useCreateIngest = ({
  createIngest,
}: {
  createIngest: FormValues | null;
}) => {
  return useRequest<{ label: string; ipAddress: string }, boolean>({
    params: createIngest
      ? {
          label: createIngest.ingestLabel,
          ipAddress: createIngest.ipAddress,
        }
      : null,
    apiCall: API.createIngest,
    errorMessage: (i) => `Failed to create ingest: ${i.label}`,
  });
};
