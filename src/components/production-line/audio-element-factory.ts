/**
 * Pure factory function to create an HTMLAudioElement from a media stream.
 * Extracted from use-rtc-connection.ts lines 70-106 (onRtcTrack handler).
 */

import { isBrowserSafari, isIpad, isMobile } from "../../bowser.ts";

export type AudioElementOptions = {
  stream: MediaStream;
  lineId: string;
  audiooutput: string | undefined;
  onError: (error: Error) => void;
  onSinkError: (error: Error) => void;
};

export const createAudioElement = ({
  stream,
  lineId,
  audiooutput,
  onError,
  onSinkError,
}: AudioElementOptions): HTMLAudioElement => {
  const audioElement = new Audio();

  audioElement.id = `rtc-audio-${lineId}-${Date.now()}`;
  audioElement.controls = false;
  audioElement.autoplay = true;
  audioElement.onerror = () => {
    onError(
      new Error(
        `Audio Error: ${audioElement.error?.code} - ${audioElement.error?.message}`
      )
    );
  };

  audioElement.srcObject = stream;

  if (audiooutput && (!isBrowserSafari || !isMobile || !isIpad)) {
    audioElement.setSinkId(audiooutput).catch((e) => {
      onSinkError(
        e instanceof Error ? e : new Error("Error assigning audio sink.")
      );
    });
  }

  return audioElement;
};
