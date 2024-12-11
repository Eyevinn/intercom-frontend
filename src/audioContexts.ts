import { AudioContext } from "standardized-audio-context";

export const audioContexts = new Map<
  HTMLAudioElement,
  { context: AudioContext; gainNode: GainNode }
>();
