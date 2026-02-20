import styled from "@emotion/styled";
import {
  MicMuted,
  MicUnmuted,
  SpeakerOff,
  SpeakerOn,
} from "../../assets/icons/icon";
import { isIOSMobile, isIpad } from "../../bowser";
import { VolumeSlider } from "../volume-slider/volume-slider";
import { ButtonIcon, UserControlBtn } from "./production-line-components";
import { TJoinProductionOptions, TLine } from "./types";
import { TUseAudioInputValues } from "./use-audio-input";

const ButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const ControlButton = styled(UserControlBtn)`
  width: unset;
  flex-grow: 1;
`;

export const UserControls = ({
  line,
  joinProductionOptions,
  isOutputMuted,
  isInputMuted,
  inputAudioStream,
  value,
  muteOutput,
  muteInput,
  handleInputChange,
}: {
  line: TLine | null;
  joinProductionOptions: TJoinProductionOptions;
  isOutputMuted: boolean;
  isInputMuted: boolean;
  inputAudioStream: TUseAudioInputValues;
  value: number;
  muteOutput: () => void;
  muteInput: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      {!isIOSMobile &&
        !isIpad &&
        !(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
          <VolumeSlider value={value} handleInputChange={handleInputChange} />
        )}
      <ButtonWrapper>
        {!(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
          <ControlButton
            type="button"
            onClick={muteOutput}
            disabled={value === 0}
          >
            <ButtonIcon
              className={isOutputMuted || value === 0 ? "mute" : "unmuted"}
            >
              {isOutputMuted || value === 0 ? <SpeakerOff /> : <SpeakerOn />}
            </ButtonIcon>
          </ControlButton>
        )}

        {inputAudioStream &&
          inputAudioStream !== "no-device" &&
          (line?.programOutputLine
            ? joinProductionOptions?.isProgramUser
            : !joinProductionOptions.isProgramUser) && (
            <ControlButton type="button" onClick={muteInput}>
              <ButtonIcon className={isInputMuted ? "mute" : "unmuted"}>
                {isInputMuted ? <MicMuted /> : <MicUnmuted />}
              </ButtonIcon>
            </ControlButton>
          )}
      </ButtonWrapper>
    </>
  );
};
