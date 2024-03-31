import { useEffect, useState } from "react";
import { TJoinProductionOptions } from "./types.ts";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";

type TUseGetRtcOfferOptions = {
  joinProductionOptions: TJoinProductionOptions | null;
};

// A hook for fetching the web rtc sdp offer from the backend
export const useGetRtcOffer = ({
  joinProductionOptions,
}: TUseGetRtcOfferOptions) => {
  const [sdpOffer, setSdpOffer] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!joinProductionOptions) return noop;

    let aborted = false;

    API.offerAudioSession({
      productionId: parseInt(joinProductionOptions.productionId, 10),
      lineId: parseInt(joinProductionOptions.lineId, 10),
      username: joinProductionOptions.username,
    }).then((response) => {
      if (aborted) return;

      setSessionId(response.sessionid);
      setSdpOffer(response.sdp);
    });

    return () => {
      aborted = true;
    };
  }, [joinProductionOptions, setSdpOffer, setSessionId]);

  return {
    sdpOffer,
    sessionId,
  };
};
