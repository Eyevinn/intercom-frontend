import {
  SpeakerOff,
  SpeakerOn,
  MicMuted,
  MicUnmuted,
} from "../../assets/icons/icon";
import { LongPressToTalkButton } from "./long-press-to-talk-button";
import {
  MinifiedControls,
  MinifiedControlsBlock,
  MinifiedControlsButton,
  PTTWrapper,
} from "./production-line-components";
import { TJoinProductionOptions, TLine } from "./types";
import { TUseAudioInputValues } from "./use-audio-input";

export const MinifiedUserControls = ({
  setIsOutputMuted,
  muteInput,
  line,
  joinProductionOptions,
  isOutputMuted,
  isInputMuted,
  inputAudioStream,
  value,
}: {
  setIsOutputMuted: () => void;
  muteInput: () => void;
  line: TLine | null;
  joinProductionOptions: TJoinProductionOptions;
  isOutputMuted: boolean;
  isInputMuted: boolean;
  inputAudioStream: TUseAudioInputValues;
  value: number;
}) => {
  return (
    <MinifiedControls>
      <MinifiedControlsBlock>
        {line &&
          !(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
            <MinifiedControlsButton
              className={isOutputMuted || value === 0 ? "off" : "on"}
              onClick={setIsOutputMuted}
            >
              {isOutputMuted || value === 0 ? <SpeakerOff /> : <SpeakerOn />}
            </MinifiedControlsButton>
          )}
        {inputAudioStream &&
          inputAudioStream !== "no-device" &&
          (line?.programOutputLine
            ? joinProductionOptions?.isProgramUser
            : !joinProductionOptions.isProgramUser) && (
            <MinifiedControlsButton
              className={isInputMuted ? "off" : "on"}
              onClick={muteInput}
            >
              {isInputMuted ? <MicMuted /> : <MicUnmuted />}
            </MinifiedControlsButton>
          )}
      </MinifiedControlsBlock>
      {inputAudioStream &&
        inputAudioStream !== "no-device" &&
        !line?.programOutputLine && (
          <MinifiedControlsBlock>
            <PTTWrapper>
              <LongPressToTalkButton
                muteInput={muteInput}
                text="Push To Talk"
              />
            </PTTWrapper>
          </MinifiedControlsBlock>
        )}
    </MinifiedControls>
  );
};
