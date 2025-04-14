import { useEffect } from "react";

interface UseCallActionHandlersProps {
  value: number;
  audioElements: HTMLAudioElement[] | null;
  isInputMuted: boolean;
  onToggleInputMute?: (handler: () => void) => void;
  onToggleOutputMute?: (handler: () => void) => void;
  onIncreaseVolume?: (handler: () => void) => void;
  onDecreaseVolume?: (handler: () => void) => void;
  onPushToTalkStart?: (handler: () => void) => void;
  onPushToTalkStop?: (handler: () => void) => void;
  setValue: (value: number) => void;
  setIsInputMuted: (value: (prev: boolean) => boolean) => void;
  muteInput: (mute: boolean) => void;
  muteOutput: () => void;
  startTalking: () => void;
  stopTalking: () => void;
}

export function useCallActionHandlers({
  value,
  audioElements,
  isInputMuted,
  onToggleInputMute,
  onToggleOutputMute,
  onIncreaseVolume,
  onDecreaseVolume,
  onPushToTalkStart,
  onPushToTalkStop,
  setValue,
  setIsInputMuted,
  muteInput,
  muteOutput,
  startTalking,
  stopTalking,
}: UseCallActionHandlersProps) {
  useEffect(() => {
    if (onToggleInputMute) {
      onToggleInputMute(() => muteInput(!isInputMuted));
    }
    if (onToggleOutputMute) {
      onToggleOutputMute(() => muteOutput());
    }
    if (onIncreaseVolume) {
      onIncreaseVolume(() => {
        const newVal = Math.min(value + 0.05, 1);
        setValue(newVal);
        audioElements?.forEach((el) => {
          const element = el;
          element.volume = newVal;
        });
      });
    }
    if (onDecreaseVolume) {
      onDecreaseVolume(() => {
        const newVal = Math.max(value - 0.05, 0);
        setValue(newVal);
        audioElements?.forEach((el) => {
          const element = el;
          element.volume = newVal;
        });
      });
    }
    if (onPushToTalkStart) {
      onPushToTalkStart(() => {
        startTalking();
      });
    }
    if (onPushToTalkStop) {
      onPushToTalkStop(() => {
        stopTalking();
      });
    }
  }, [
    onToggleInputMute,
    onToggleOutputMute,
    onIncreaseVolume,
    onDecreaseVolume,
    onPushToTalkStart,
    onPushToTalkStop,
    startTalking,
    stopTalking,
    value,
    setValue,
    setIsInputMuted,
    audioElements,
    muteOutput,
    muteInput,
    isInputMuted,
  ]);
}
