import { useMemo } from "react";
// TODO update audio to non-questionable-licensed-audio
import connectionStart from "../../assets/sounds/start-connection.mp3";
import connectionStop from "../../assets/sounds/stop-connection.mp3";

export const useAudioCue = () => {
  const onEnterNotificationSound = useMemo(() => {
    const audio = new Audio(connectionStart);
    audio.load();
    return audio;
  }, []);

  const onExitNotificationSound = useMemo(() => {
    const audio = new Audio(connectionStop);
    audio.load();
    return audio;
  }, []);

  return {
    playEnterSound: () => {
      onEnterNotificationSound.play();
    },
    playExitSound: () => {
      onExitNotificationSound.play();
    },
  };
};
