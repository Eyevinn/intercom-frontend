import { useEffect, useRef, useState } from "react";
import { CallState } from "../../global-state/types";

export const useSpeakerDetection = ({
  isProgramOutputAdded,
  calls,
}: {
  isProgramOutputAdded: boolean;
  calls: Record<string, CallState>;
}) => {
  const [isSomeoneSpeaking, setIsSomeoneSpeaking] = useState(false);
  const [shouldReduceVolume, setShouldReduceVolume] = useState(false);
  const startTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isProgramOutputAdded) {
      setIsSomeoneSpeaking(
        Object.entries(calls).some(
          ([, callState]) =>
            !callState.joinProductionOptions?.lineUsedForProgramOutput &&
            callState.audioLevelAboveThreshold &&
            !callState.joinProductionOptions?.isProgramUser
        )
      );
    }
  }, [calls, isProgramOutputAdded]);

  useEffect(() => {
    if (isSomeoneSpeaking) {
      if (!shouldReduceVolume) {
        startTimeoutRef.current = window.setTimeout(() => {
          setShouldReduceVolume(true);
        }, 1000);
      }
    } else if (shouldReduceVolume) {
      setShouldReduceVolume(false);
    }

    return () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
    };
  }, [isSomeoneSpeaking, shouldReduceVolume]);

  return { isSomeoneSpeaking, shouldReduceVolume };
};
