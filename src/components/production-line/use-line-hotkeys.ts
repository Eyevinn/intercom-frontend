import { useHotkeys } from "react-hotkeys-hook";

type TuseLineHotkeys = {
  muteInput: (mute: boolean) => void;
  isInputMuted: boolean;
};

type TuseSpeakerHotkeys = {
  muteOutput: (mute: boolean) => void;
  isOutputMuted: boolean;
};

export const useLineHotkeys = ({
  muteInput,
  isInputMuted,
}: TuseLineHotkeys) => {
  useHotkeys("m", () => {
    muteInput(!isInputMuted);
  });

  useHotkeys(
    "t",
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
}: TuseSpeakerHotkeys) => {
  useHotkeys("n", () => {
    muteOutput(!isOutputMuted);
  });
};
