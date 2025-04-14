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
  const shouldReduceVolumeRef = useRef(false);

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

  const startTimeoutRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSomeoneSpeaking) {
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      if (!shouldReduceVolumeRef.current && startTimeoutRef.current === null) {
        startTimeoutRef.current = window.setTimeout(() => {
          shouldReduceVolumeRef.current = true;
          setShouldReduceVolume(true);
          startTimeoutRef.current = null;
        }, 1000);
      }
    } else {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }

      if (shouldReduceVolumeRef.current && stopTimeoutRef.current === null) {
        stopTimeoutRef.current = window.setTimeout(() => {
          shouldReduceVolumeRef.current = false;
          setShouldReduceVolume(false);
          stopTimeoutRef.current = null;
        }, 1000);
      }
    }

    return () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    };
  }, [isSomeoneSpeaking]);

  return { isSomeoneSpeaking, shouldReduceVolume };
};
