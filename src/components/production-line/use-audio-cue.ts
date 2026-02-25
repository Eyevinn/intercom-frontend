import { useRef, useCallback } from "react";
import connectionStart from "../../assets/sounds/start-connection-451.wav";
import connectionStop from "../../assets/sounds/stop-connection-451.wav";

export const useAudioCue = () => {
  const enterAudioRef = useRef<HTMLAudioElement | null>(null);
  const exitAudioRef = useRef<HTMLAudioElement | null>(null);

  const playEnterSound = useCallback(() => {
    if (!enterAudioRef.current) {
      enterAudioRef.current = new Audio(connectionStart);
      enterAudioRef.current.load();
    }
    enterAudioRef.current.play();
  }, []);

  const playExitSound = useCallback(() => {
    if (!exitAudioRef.current) {
      exitAudioRef.current = new Audio(connectionStop);
      exitAudioRef.current.load();
    }
    exitAudioRef.current.play();
  }, []);

  return {
    playEnterSound,
    playExitSound,
  };
};
