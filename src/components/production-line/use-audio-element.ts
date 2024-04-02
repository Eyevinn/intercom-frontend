import { RefObject, useEffect, useState } from "react";
import {
  FilteredMediaEvent,
  getMediaEventFilter,
} from "@eyevinn/media-event-filter";

type TUseAudioElementOptions = {
  audioContainerRef: RefObject<HTMLDivElement>;
};

export const useAudioElement = ({
  audioContainerRef,
}: TUseAudioElementOptions) => {
  const [audioElement] = useState(new Audio());
  const [playbackState, setPlaybackState] = useState<FilteredMediaEvent | null>(
    null
  );

  // TODO extract audio element hooks to separate file
  // Set up audio element
  useEffect(() => {
    audioElement.controls = true;
    audioElement.autoplay = true;
    audioElement.onerror = console.error;

    const { teardown } = getMediaEventFilter({
      mediaElement: audioElement,
      callback: (ev) => {
        if (ev === FilteredMediaEvent.TIME_UPDATE) return;

        setPlaybackState(ev);
      },
    });

    return teardown;
  }, [audioElement]);

  // Attach audio element to DOM
  useEffect(() => {
    if (!audioContainerRef) return;

    if (audioContainerRef.current) {
      audioContainerRef.current.appendChild(audioElement);
    }
  }, [audioContainerRef, audioElement]);

  return {
    playbackState,
    audioElement,
  };
};
