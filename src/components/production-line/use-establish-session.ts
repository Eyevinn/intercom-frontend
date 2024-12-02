import { Dispatch, useEffect, useRef, useState } from "react";
import { TJoinProductionOptions } from "./types.ts";
import { noop } from "../../helpers.ts";
import { API } from "../../api/api.ts";
import { TGlobalStateAction } from "../../global-state/global-state-actions.ts";

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
  const cleanupCalled = useRef(false);

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
  useEffect(() => {
    console.log("useEstablishSession - sessionId at line58:", sessionId);
    return () => {
      if (cleanupCalled.current) {
        console.log("useEstablishSession - sessionId at line61:", sessionId);
        return;
      }

      cleanupCalled.current = true;

      if (!joinProductionOptions) {
        console.log(
          "useEstablishSession - no joinProductionOptions:",
          sessionId
        );
        return;
      }
      console.log("useEstablishSession - sessionId at line74:", sessionId);

      if (sessionId) {
        API.deleteAudioSession({ sessionId })
          .then((r) => {
            console.log(`delete_${sessionId}:`, r);
            cleanupCalled.current = false;
            setSessionId(null);
          })
          .catch((e) => {
            console.log("Error:", e);
            // Reset the flag after an error
            cleanupCalled.current = false;
          });
      } else {
        // Reset the flag if no sessionId
        cleanupCalled.current = false;
      }
    };
  }, [sessionId, joinProductionOptions]);

  return {
    sdpOffer,
    sessionId,
    setSessionId,
  };
};
