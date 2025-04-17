import { API, TShareUrlOptions } from "../../api/api";

export const useShareLine = () => {
  const shareCall = (data: TShareUrlOptions) => API.shareUrl(data);

  return shareCall;
};
