import { useState, useRef, useEffect } from "react";

export const useActiveParticipant = (audioLevelAboveThreshold: boolean) => {
  const [isActiveParticipant, setIsActiveParticipant] = useState(false);
  const activeParticipantRef = useRef(false);
  const startSpeakingTimeoutRef = useRef<number | null>(null);
  const stopSpeakingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioLevelAboveThreshold) {
      if (stopSpeakingTimeoutRef.current) {
        window.clearTimeout(stopSpeakingTimeoutRef.current);
        stopSpeakingTimeoutRef.current = null;
      }

      if (!startSpeakingTimeoutRef.current) {
        startSpeakingTimeoutRef.current = window.setTimeout(() => {
          setIsActiveParticipant(true);
          activeParticipantRef.current = true;
          startSpeakingTimeoutRef.current = null;
        }, 500);
      }
    } else {
      if (startSpeakingTimeoutRef.current) {
        window.clearTimeout(startSpeakingTimeoutRef.current);
        startSpeakingTimeoutRef.current = null;
      }

      if (activeParticipantRef.current && !stopSpeakingTimeoutRef.current) {
        stopSpeakingTimeoutRef.current = window.setTimeout(() => {
          setIsActiveParticipant(false);
          activeParticipantRef.current = false;
          stopSpeakingTimeoutRef.current = null;
        }, 1000);
      }
    }

    return () => {
      if (startSpeakingTimeoutRef.current) {
        window.clearTimeout(startSpeakingTimeoutRef.current);
      }
      if (stopSpeakingTimeoutRef.current) {
        window.clearTimeout(stopSpeakingTimeoutRef.current);
      }
    };
  }, [audioLevelAboveThreshold]);

  // Keep ref in sync with state for external updates
  useEffect(() => {
    activeParticipantRef.current = isActiveParticipant;
  }, [isActiveParticipant]);

  return { isActiveParticipant, setIsActiveParticipant };
};
