import { Dispatch, useEffect, useRef, useState } from "react";
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
  const reqRef = useRef<{
    key: string;
    t: number | null;
    cancelled: boolean;
  } | null>(null);

  // Establish audio session
  useEffect(() => {
    if (!joinProductionOptions) return noop;

    const { productionId, lineId, username } = joinProductionOptions;
    const key = `${callId}-${productionId}-${lineId}-${username}`;

    if (reqRef.current?.key === key) {
      if (reqRef.current.t != null) {
        window.clearTimeout(reqRef.current.t);
        reqRef.current.t = null;
      }
      reqRef.current.cancelled = false;
      return noop;
    }

    const state = { key, cancelled: false, t: null as number | null };
    reqRef.current = state;

    API.offerAudioSession({
      productionId: parseInt(productionId, 10),
      lineId: parseInt(lineId, 10),
      username,
    })
      .then((response) => {
        if (state.cancelled) {
          API.deleteAudioSession({ sessionId: response.sessionId }).catch(
            logger.red
          );
          return;
        }

        setSessionId(response.sessionId);
        setSdpOffer(response.sdp);
      })
      .catch((e) => {
        if (!state.cancelled) {
          reqRef.current = null;
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
        }
      });

    return () => {
      const current = reqRef.current;
      const timeoutId = window.setTimeout(() => {
        if (reqRef.current === current) {
          if (current) current.cancelled = true;
          reqRef.current = null;
        }
      }, 0);

      if (current) {
        current.t = timeoutId;
      }
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
