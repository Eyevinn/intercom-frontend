import { useState, useRef, useEffect } from "react";

export const useActiveParticipant = (audioLevelAboveThreshold: boolean) => {
  const [activeParticipant, setActiveParticipant] = useState(false);
  const startSpeakingTimeoutRef = useRef<number | null>(null);
  const stopSpeakingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioLevelAboveThreshold) {
      if (stopSpeakingTimeoutRef.current) {
        window.clearTimeout(stopSpeakingTimeoutRef.current);
        stopSpeakingTimeoutRef.current = null;
      }

      if (!startSpeakingTimeoutRef.current && !activeParticipant) {
        startSpeakingTimeoutRef.current = window.setTimeout(() => {
          setActiveParticipant(true);
          startSpeakingTimeoutRef.current = null;
        }, 500);
      }
    } else {
      if (startSpeakingTimeoutRef.current) {
        window.clearTimeout(startSpeakingTimeoutRef.current);
        startSpeakingTimeoutRef.current = null;
      }

      if (activeParticipant && !stopSpeakingTimeoutRef.current) {
        stopSpeakingTimeoutRef.current = window.setTimeout(() => {
          setActiveParticipant(false);
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
  }, [audioLevelAboveThreshold, activeParticipant]);

  return { activeParticipant, setActiveParticipant };
};
