import { useRequest } from "./use-request";
import { API, TSavedReceiver, getBackendBaseUrl } from "../api/api";

type FormValues = {
  label?: string;
  productionId: number;
  lineId: number;
  whepUsername: string;
  srtUrl: string;
};

export const useCreateReceiver = ({
  createReceiver,
}: {
  createReceiver: FormValues | null;
}) => {
  return useRequest<
    {
      label?: string;
      productionId: number;
      lineId: number;
      whepUrl: string;
      srtUrl: string;
    },
    TSavedReceiver
  >({
    params: createReceiver
      ? {
          label: createReceiver.label,
          productionId: createReceiver.productionId,
          lineId: createReceiver.lineId,
          whepUrl: `${getBackendBaseUrl()}/api/v1/whep/${createReceiver.productionId}/${createReceiver.lineId}/${encodeURIComponent(createReceiver.whepUsername)}`,
          srtUrl: createReceiver.srtUrl,
        }
      : null,
    apiCall: API.createReceiver,
    errorMessage: (t) => `Failed to create receiver: ${t.label || ""}`,
  });
};
