import { useEffect } from "react";

interface UseCallActionHandlersProps {
  value: number;
  audioElements: HTMLAudioElement[] | null;
  isInputMuted: boolean;
  isProgramOutputLine: boolean | null | undefined;
  isProgramUser: boolean | null | undefined;
  setValue: (value: number) => void;
  muteInput: (mute: boolean) => void;
  muteOutput: () => void;
  startTalking: () => void;
  stopTalking: () => void;
  setActionHandler: (action: string, handler: () => void) => void;
}

export function useCallActionHandlers({
  value,
  audioElements,
  isInputMuted,
  isProgramOutputLine,
  isProgramUser,
  setValue,
  muteInput,
  muteOutput,
  startTalking,
  stopTalking,
  setActionHandler,
}: UseCallActionHandlersProps) {
  useEffect(() => {
    setActionHandler("toggle_input_mute", () => {
      if (isProgramOutputLine && !isProgramUser) {
        return;
      }

      muteInput(!isInputMuted);
    });
    setActionHandler("toggle_output_mute", () => {
      if (isProgramOutputLine && isProgramUser) {
        return;
      }

      muteOutput();
    });
    setActionHandler("increase_volume", () => {
      const newVal = Math.min(value + 0.05, 1);
      setValue(newVal);
      audioElements?.forEach((el) => {
        const element = el;
        element.volume = newVal;
      });
    });
    setActionHandler("decrease_volume", () => {
      const newVal = Math.max(value - 0.05, 0);
      setValue(newVal);
      audioElements?.forEach((el) => {
        const element = el;
        element.volume = newVal;
      });
    });
    setActionHandler("push_to_talk_start", () => startTalking());
    setActionHandler("push_to_talk_stop", () => stopTalking());
  }, [
    value,
    setValue,
    audioElements,
    isInputMuted,
    muteInput,
    muteOutput,
    startTalking,
    stopTalking,
    setActionHandler,
    isProgramOutputLine,
    isProgramUser,
  ]);
}
