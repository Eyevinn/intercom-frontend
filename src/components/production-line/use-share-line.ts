import { API, TShareUrlOptions } from "../../api/api";

export const useShareLine = (data: TShareUrlOptions) => {
  const shareCall = () => API.shareUrl(data);

  return shareCall;
};
