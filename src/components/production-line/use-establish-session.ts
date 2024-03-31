import { useEffect, useState } from "react";
import { TJoinProductionOptions } from "./types.ts";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";

type TUseGetRtcOfferOptions = {
  joinProductionOptions: TJoinProductionOptions | null;
};

// A hook for fetching the web rtc sdp offer from the backend
export const useEstablishSession = ({
  joinProductionOptions,
}: TUseGetRtcOfferOptions) => {
  const [sdpOffer, setSdpOffer] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Establish audio session
  useEffect(() => {
    if (!joinProductionOptions) return noop;

    let aborted = false;

    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    API.offerAudioSession({
      productionId,
      lineId,
      username: joinProductionOptions.username,
    }).then((response) => {
      if (aborted) return;

      setSessionId(response.sessionid);
      setSdpOffer(response.sdp);
    });

    return () => {
      aborted = true;
    };
  }, [joinProductionOptions]);

  // Clean up audio session
  useEffect(
    () => () => {
      if (!joinProductionOptions) return;

      const productionId = parseInt(joinProductionOptions.productionId, 10);
      const lineId = parseInt(joinProductionOptions.lineId, 10);

      if (sessionId) {
        API.deleteAudioSession({
          sessionId,
          productionId,
          lineId,
        });
      }
    },
    [sessionId, joinProductionOptions]
  );

  return {
    sdpOffer,
    sessionId,
  };
};
