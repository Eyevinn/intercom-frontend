import { API } from "../../../api/api";
import { useRequest } from "../../../hooks/use-request";

type FormValues = {
  ingestName: string;
  ipAddress: string;
};

export const useCreateIngest = ({
  createIngest,
}: {
  createIngest: FormValues | null;
}) => {
  return useRequest<{ name: string; ipAddress: string }, boolean>({
    params: createIngest
      ? {
          name: createIngest.ingestName,
          ipAddress: createIngest.ipAddress,
        }
      : null,
    apiCall: API.createIngest,
    errorMessage: (i) => `Failed to create ingest: ${i.name}`,
  });
};
