import { useCallback, useRef } from "react";
import { API } from "../../api/api.ts";
import { TJoinProductionOptions } from "./types.ts";

const PIN_RETRY_DELAYS_MS = [300, 600, 1000, 1500, 2000];

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

type UseVideoSourcePinArgs = {
  joinProductionOptions: TJoinProductionOptions | null;
  callSessionId: string | null;
};

type UseVideoSourcePinResult = {
  pushWhepSourceToBackend: (nextSessionId: string | null) => void;
  pushVideoSourceToBackend: (nextSessionId: string | null) => Promise<void>;
};

export const useVideoSourcePin = ({
  joinProductionOptions,
  callSessionId,
}: UseVideoSourcePinArgs): UseVideoSourcePinResult => {
  const pushWhepSourceToBackend = useCallback(
    (nextSessionId: string | null) => {
      if (
        !joinProductionOptions?.productionId ||
        !joinProductionOptions?.lineId
      ) {
        return;
      }
      if (nextSessionId === "") {
        return;
      }
      API.setLineWhepSource({
        productionId: joinProductionOptions.productionId,
        lineId: joinProductionOptions.lineId,
        sessionId: nextSessionId,
      }).catch(() => {});
    },
    [joinProductionOptions?.productionId, joinProductionOptions?.lineId]
  );

  const latestPinRequestRef = useRef<string | null>(null);

  const pushVideoSourceToBackend = useCallback(
    async (nextSessionId: string | null): Promise<void> => {
      if (!callSessionId) return;
      if (nextSessionId === "") return;

      latestPinRequestRef.current = nextSessionId;

      for (
        let attempt = 0;
        attempt <= PIN_RETRY_DELAYS_MS.length;
        attempt += 1
      ) {
        if (latestPinRequestRef.current !== nextSessionId) {
          return;
        }
        try {
          // eslint-disable-next-line no-await-in-loop
          await API.setSessionVideoSource({
            sessionId: callSessionId,
            pinnedSessionId: nextSessionId,
          });
          return;
        } catch (err) {
          const status = (err as Error & { status?: number })?.status;

          if (status !== 425 || attempt === PIN_RETRY_DELAYS_MS.length) {
            return;
          }
          // eslint-disable-next-line no-await-in-loop
          await delay(PIN_RETRY_DELAYS_MS[attempt]);
        }
      }
    },
    [callSessionId]
  );

  return { pushWhepSourceToBackend, pushVideoSourceToBackend };
};
