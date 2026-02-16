import { useCallback, useState } from "react";

type UsePushToTalkOptions = {
  muteInput: (mute: boolean) => void;
};

export function usePushToTalk({ muteInput }: UsePushToTalkOptions) {
  const [isTalking, setIsTalking] = useState<boolean>(false);

  const startTalking = useCallback(() => {
    muteInput(false);
    setIsTalking(true);
  }, [muteInput]);

  const stopTalking = useCallback(() => {
    muteInput(true);
    setIsTalking(false);
  }, [muteInput]);

  const handleLongPressStart = useCallback(() => {
    // Start talking immediately — no delay. Audio tracks are pre-opened,
    // so toggling track.enabled is instant. The previous 300ms setTimeout
    // was causing first-syllable loss (violates R2.1).
    startTalking();
  }, [startTalking]);

  const handleLongPressEnd = useCallback(() => {
    stopTalking();
  }, [stopTalking]);

  return {
    isTalking,
    handleLongPressStart,
    handleLongPressEnd,
    startTalking,
    stopTalking,
  };
}
