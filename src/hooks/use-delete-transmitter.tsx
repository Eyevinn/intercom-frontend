import { API } from "../api/api";
import { useRequest } from "./use-request";

export const useDeleteTransmitter = (id: string | null) => {
  return useRequest<string, string>({
    params: id,
    apiCall: API.deleteTransmitter,
    errorMessage: () => "Failed to delete transmitter",
  });
};
