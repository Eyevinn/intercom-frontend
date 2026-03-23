import { useEffect, useRef } from "react";
import { useGlobalState } from "../global-state/context-provider";
import { useInitiateProductionCall } from "./use-initiate-production-call";
import { AUTO_JOIN_STORAGE_KEY, TAutoJoinCall } from "../utils/auto-join";

export const useAutoJoinRestore = () => {
  const [{ calls, userSettings, devices }, dispatch] = useGlobalState();
  const { initiateProductionCall } = useInitiateProductionCall({ dispatch });
  const callsWereActive = useRef(false);
  const hasRestored = useRef(false);

  // On mount: restore calls if localStorage has a saved config and state is empty
  useEffect(() => {
    if (hasRestored.current) return;

    const stored = localStorage.getItem(AUTO_JOIN_STORAGE_KEY);
    if (!stored || Object.keys(calls).length > 0) return;

    let savedCalls: TAutoJoinCall[];
    try {
      savedCalls = JSON.parse(stored);
    } catch {
      localStorage.removeItem(AUTO_JOIN_STORAGE_KEY);
      return;
    }

    if (savedCalls.length === 0) return;

    hasRestored.current = true;

    const username = userSettings?.username || "Auto";
    const audiooutput = userSettings?.audiooutput;
    const audioinput =
      userSettings?.audioinput || devices?.input?.[0]?.deviceId;

    savedCalls.forEach((call) => {
      initiateProductionCall({
        payload: {
          joinProductionOptions: {
            productionId: call.productionId,
            lineId: call.lineId,
            username,
            audioinput,
            lineUsedForProgramOutput: false,
            isProgramUser: false,
          },
          audiooutput,
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear stored config when the user intentionally empties all calls
  useEffect(() => {
    if (Object.keys(calls).length > 0) {
      callsWereActive.current = true;
    } else if (callsWereActive.current) {
      localStorage.removeItem(AUTO_JOIN_STORAGE_KEY);
      callsWereActive.current = false;
    }
  }, [calls]);
};
