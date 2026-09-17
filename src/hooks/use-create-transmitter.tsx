import { useRequest } from "./use-request";
import { API, TSavedTransmitter, getBackendBaseUrl } from "../api/api";

type FormValues = {
  label?: string;
  productionId: number;
  lineId: number;
  whipUsername: string;
  port: number;
  passThroughUrl?: string;
  mode: "caller" | "listener";
  srtUrl?: string;
  noVideo?: boolean;
  vp8?: boolean;
  bypassVideo?: boolean;
};

export const useCreateTransmitter = ({
  createTransmitter,
}: {
  createTransmitter: FormValues | null;
}) => {
  return useRequest<
    {
      label?: string;
      port: number;
      productionId: number;
      lineId: number;
      whipUrl: string;
      mode: "caller" | "listener";
      srtUrl?: string;
      passThroughUrl?: string;
      noVideo?: boolean;
      vp8?: boolean;
      bypassVideo?: boolean;
    },
    TSavedTransmitter
  >({
    params: createTransmitter
      ? {
          label: createTransmitter.label,
          port: createTransmitter.port,
          productionId: createTransmitter.productionId,
          lineId: createTransmitter.lineId,
          whipUrl: `${getBackendBaseUrl()}/api/v1/whip/${createTransmitter.productionId}/${createTransmitter.lineId}/${encodeURIComponent(createTransmitter.whipUsername)}`,
          passThroughUrl: createTransmitter.passThroughUrl,
          mode: createTransmitter.mode,
          srtUrl: createTransmitter.srtUrl,
          noVideo: createTransmitter.noVideo,
          vp8: createTransmitter.vp8,
          bypassVideo: createTransmitter.bypassVideo,
        }
      : null,
    apiCall: API.createTransmitter,
    errorMessage: (t) => `Failed to create transmitter: ${t.label || ""}`,
  });
};
