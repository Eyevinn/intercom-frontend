import { useHotkeys } from "react-hotkeys-hook";

type TuseLineHotkeys = {
  muteInput: (mute: boolean) => void;
  isInputMuted: boolean;
  customKeyMute?: string;
  customKeyPress?: string;
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
}: TuseLineHotkeys) => {
  const muteInputKey = customKeyMute || "m";
  const mutePressKey = customKeyPress || "t";

  useHotkeys(muteInputKey, () => {
    muteInput(!isInputMuted);
  });

  useHotkeys(
    mutePressKey,
    (e) => {
      if (e.type === "keydown") {
        muteInput(false);
      } else {
        muteInput(true);
      }
    },
    {
      keyup: true,
      keydown: true,
    }
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
