import { useHotkeys } from "react-hotkeys-hook";

type TuseLineHotkeys = {
  muteInput: (mute: boolean) => void;
  isInputMuted: boolean;
  customKeyMute?: string;
  customKeyPress?: string;
  startTalking?: () => void;
  stopTalking?: () => void;
};

type TuseSpeakerHotkeys = {
  muteOutput: (mute: boolean) => void;
  isOutputMuted: boolean;
  customKey?: string;
};

type TuseGlobalHotkeys = {
  muteInput: (mute: boolean) => void;
  isInputMuted: boolean;
  customKey?: string;
};

export const useLineHotkeys = ({
  muteInput,
  isInputMuted,
  customKeyMute,
  customKeyPress,
  startTalking,
  stopTalking,
}: TuseLineHotkeys) => {
  const muteInputKey = customKeyMute || "m";
  const pttKey = customKeyPress || "t";

  useHotkeys(muteInputKey, () => {
    muteInput(!isInputMuted);
  });

  useHotkeys(
    pttKey,
    (e) => {
      if (e.type === "keydown") {
        if ((e as KeyboardEvent).repeat) return;
        if (startTalking) {
          startTalking();
        } else {
          muteInput(false);
        }
      } else {
        if (stopTalking) {
          stopTalking();
        } else {
          muteInput(true);
        }
      }
      e.preventDefault();
    },
    { keydown: true, keyup: true }
  );
};

export const useSpeakerHotkeys = ({
  muteOutput,
  isOutputMuted,
  customKey,
}: TuseSpeakerHotkeys) => {
  const muteOutputKey = customKey || "n";

  useHotkeys(muteOutputKey, () => {
    muteOutput(!isOutputMuted);
  });
};

export const useGlobalHotkeys = ({
  muteInput,
  isInputMuted,
  customKey,
}: TuseGlobalHotkeys) => {
  const muteInputKey = customKey || "p";

  useHotkeys(muteInputKey, () => {
    muteInput(!isInputMuted);
  });
};
