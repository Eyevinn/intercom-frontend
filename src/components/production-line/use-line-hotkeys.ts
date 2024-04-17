import { useHotkeys } from "react-hotkeys-hook";

type TProps = {
  muteInput: (mute: boolean) => void;
  isInputMuted: boolean;
};

export const useLineHotkeys = ({ muteInput, isInputMuted }: TProps) => {
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
