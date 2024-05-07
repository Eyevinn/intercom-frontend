import { useMemo } from "react";
import connectionStart from "../../assets/sounds/start-connection-451.wav";
import connectionStop from "../../assets/sounds/stop-connection-451.wav";

export const useAudioCue = () => {
  const playEnterSound = useMemo(() => {
    const audio = new Audio(connectionStart);
    audio.load();
    return () => {
      audio.play();
    };
  }, []);

  const playExitSound = useMemo(() => {
    const audio = new Audio(connectionStop);
    audio.load();
    return () => {
      audio.play();
    };
  }, []);

  return {
    playEnterSound,
    playExitSound,
  };
};
