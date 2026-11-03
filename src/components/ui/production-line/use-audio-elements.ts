/**
 * Hook managing audio element state, ref synchronization, cleanup, and
 * unmount teardown. Extracted from use-rtc-connection.ts lines 297-329.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export const useAudioElements = () => {
  const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);
  const audioElementsRef = useRef<HTMLAudioElement[]>(audioElements);

  // Keep ref in sync with state so cleanup always uses latest array
  useEffect(() => {
    audioElementsRef.current = audioElements;
  }, [audioElements]);

  const cleanUpAudio = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      el.pause();
      // eslint-disable-next-line no-param-reassign
      el.srcObject = null;
    });
  }, [audioElementsRef]);

  // Teardown on unmount
  useEffect(
    () => () => {
      cleanUpAudio();
    },
    [cleanUpAudio]
  );

  return { audioElements, setAudioElements, cleanUpAudio };
};
