import { API } from "../api/api";
import { useRequest } from "./use-request";

export const useDeleteReceiver = (receiverId: string | null) => {
  return useRequest<string, string>({
    params: receiverId,
    apiCall: API.deleteReceiver,
    errorMessage: () => "Failed to delete receiver",
  });
};
