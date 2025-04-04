import { Dispatch, useEffect, useState } from "react";
import { TJoinProductionOptions } from "./types.ts";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";
import logger from "../../utils/logger.ts";

type TUseGetRtcOfferOptions = {
  joinProductionOptions: TJoinProductionOptions | null;
  callId: string;
  dispatch: Dispatch<TGlobalStateAction>;
};

// A hook for fetching the web rtc sdp offer from the backend
export const useEstablishSession = ({
  joinProductionOptions,
  callId,
  dispatch,
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
    })
      .then((response) => {
        if (aborted) return;

        setSessionId(response.sessionId);
        setSdpOffer(response.sdp);
      })
      .catch((e) => {
        dispatch({
          type: "ERROR",
          payload: {
            callId,
            error:
              e instanceof Error
                ? e
                : new Error("Failed to establish audio session."),
          },
        });
      });

    return () => {
      aborted = true;
    };
  }, [callId, dispatch, joinProductionOptions]);

  // Clean up audio session
  useEffect(
    () => () => {
      if (!joinProductionOptions) return;
      if (sessionId) {
        API.deleteAudioSession({
          sessionId,
        }).catch(logger.red);
      }
    },
    [sessionId, joinProductionOptions]
  );

  return {
    sdpOffer,
    sessionId,
  };
};
