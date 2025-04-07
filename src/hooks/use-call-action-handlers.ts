import { useEffect } from "react";

interface UseCallActionHandlersProps {
  value: number;
  audioElements: HTMLAudioElement[] | null;
  onToggleInputMute?: (handler: () => void) => void;
  onToggleOutputMute?: (handler: () => void) => void;
  onIncreaseVolume?: (handler: () => void) => void;
  onDecreaseVolume?: (handler: () => void) => void;
  onPushToTalk?: (handler: () => void) => void;
  setValue: (value: number) => void;
  setIsInputMuted: (value: (prev: boolean) => boolean) => void;
  muteOutput: () => void;
  triggerPushToTalk: () => void;
}

export function useCallActionHandlers({
  value,
  audioElements,
  onToggleInputMute,
  onToggleOutputMute,
  onIncreaseVolume,
  onDecreaseVolume,
  onPushToTalk,
  setValue,
  setIsInputMuted,
  muteOutput,
  triggerPushToTalk,
}: UseCallActionHandlersProps) {
  useEffect(() => {
    if (onToggleInputMute) {
      onToggleInputMute(() => setIsInputMuted((prev) => !prev));
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
    if (onPushToTalk) {
      onPushToTalk(() => {
        triggerPushToTalk();
      });
    }
  }, [
    onToggleInputMute,
    onToggleOutputMute,
    onIncreaseVolume,
    onDecreaseVolume,
    onPushToTalk,
    value,
    setValue,
    setIsInputMuted,
    audioElements,
    muteOutput,
    triggerPushToTalk,
  ]);
}
