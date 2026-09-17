import { useCallback, useEffect, useRef, useState } from "react";
import { stopFrameMonitor } from "./video-element-factory.ts";

export const useVideoElements = () => {
  const [videoElements, setVideoElements] = useState<HTMLVideoElement[]>([]);
  const videoElementsRef = useRef<HTMLVideoElement[]>(videoElements);

  useEffect(() => {
    videoElementsRef.current = videoElements;
  }, [videoElements]);

  const cleanUpVideo = useCallback(() => {
    videoElementsRef.current.forEach((el) => {
      stopFrameMonitor(el);
      el.pause();
      // eslint-disable-next-line no-param-reassign
      el.srcObject = null;
    });
  }, [videoElementsRef]);

  useEffect(
    () => () => {
      cleanUpVideo();
    },
    [cleanUpVideo]
  );

  return { videoElements, setVideoElements, cleanUpVideo };
};
