import { useState } from "react";
import logger from "../utils/logger";
import { useShareLine } from "../components/production-line/use-share-line";

export const useShareUrl = () => {
  const [url, setUrl] = useState<string>("");
  const shareLine = useShareLine();

  const shareUrl = async ({
    productionId,
    lineId,
  }: {
    productionId: string;
    lineId: string;
  }) => {
    const path = `/production-calls/production/${productionId}/line/${lineId}`;

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
