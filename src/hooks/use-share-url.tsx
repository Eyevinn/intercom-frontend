import { useState } from "react";
import logger from "../utils/logger";
import { useShareLine } from "../components/production-line/use-share-line";
import { buildCallsUrl } from "../utils/call-url";
import { appendGuestParam } from "../utils/guest-session";

export const useShareUrl = () => {
  const [url, setUrl] = useState<string>("");
  const shareLine = useShareLine();

  const shareUrl = async ({
    productionId,
    lineId,
    guest = false,
  }: {
    productionId: string;
    lineId: string;
    guest?: boolean;
  }) => {
    const callsPath = buildCallsUrl([{ productionId, lineId }]);
    const path = guest ? appendGuestParam(callsPath) : callsPath;

    try {
      const res = await shareLine({ path });
      setUrl(res.url);
      return res.url;
    } catch (error) {
      logger.red(`Error sharing: ${error}`);
      return "";
    }
  };

  return { shareUrl, url };
};
