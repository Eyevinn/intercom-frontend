import { useCallback, useEffect, useRef, useState } from "react";

type UsePushToTalkOptions = {
  muteInput: (mute: boolean) => void;
};

export function usePushToTalk({ muteInput }: UsePushToTalkOptions) {
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTalking = useCallback(() => {
    muteInput(false);
    setIsTalking(true);
  }, [muteInput]);

  const stopTalking = useCallback(() => {
    muteInput(true);
    setIsTalking(false);
  }, [muteInput]);

  const handleLongPressStart = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      startTalking();
    }, 300);
  }, [startTalking]);

  const handleLongPressEnd = useCallback(() => {
    stopTalking();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [stopTalking]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isTalking,
    handleLongPressStart,
    handleLongPressEnd,
    startTalking,
    stopTalking,
  };
}
