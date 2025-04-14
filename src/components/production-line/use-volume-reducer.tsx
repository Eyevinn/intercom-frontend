import { useEffect, useRef } from "react";
import { TLine } from "./types";

export const useVolumeReducer = ({
  line,
  audioElements,
  shouldReduceVolume,
  value,
}: {
  line: TLine | null;
  audioElements: HTMLAudioElement[] | null;
  shouldReduceVolume: boolean;
  value: number;
}) => {
  const hasReducedRef = useRef(false);

  useEffect(() => {
    // Reduce volume by 80%
    const volumeChangeFactor = 0.2;

    if (line?.programOutputLine) {
      if (shouldReduceVolume && !hasReducedRef.current) {
        hasReducedRef.current = true;

        audioElements?.forEach((audioElement) => {
          // eslint-disable-next-line no-param-reassign
          audioElement.volume = value * volumeChangeFactor;
        });
      }

      if (!shouldReduceVolume && hasReducedRef.current) {
        audioElements?.forEach((audioElement) => {
          // eslint-disable-next-line no-param-reassign
          audioElement.volume = value;
        });
        hasReducedRef.current = false;
      }
    }
  }, [audioElements, line?.programOutputLine, shouldReduceVolume, value]);
};
