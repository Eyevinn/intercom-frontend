import { useMemo } from "react";
// TODO update audio to non-questionable-licensed-audio
import connectionStart from "../../assets/sounds/start-connection.mp3";
import connectionStop from "../../assets/sounds/stop-connection.mp3";

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
