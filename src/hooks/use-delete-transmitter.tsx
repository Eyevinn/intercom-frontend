import { API } from "../api/api";
import { useRequest } from "./use-request";

export const useDeleteTransmitter = (port: string | null) => {
  return useRequest<string, string>({
    params: port,
    apiCall: API.deleteTransmitter,
    errorMessage: () => "Failed to delete transmitter",
  });
};
