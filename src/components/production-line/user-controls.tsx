import {
  SpeakerOff,
  SpeakerOn,
  MicMuted,
  MicUnmuted,
} from "../../assets/icons/icon";
import { isIOSMobile, isIpad } from "../../bowser";
import { FlexContainer } from "../generic-components";
import { VolumeSlider } from "../volume-slider/volume-slider";
import {
  FlexButtonWrapper,
  UserControlBtn,
  ButtonIcon,
} from "./production-line-components";
import { TLine, TJoinProductionOptions } from "./types";
import { TUseAudioInputValues } from "./use-audio-input";

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
      <FlexContainer>
        {!(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
          <FlexButtonWrapper
            className="first"
            isProgramUser={joinProductionOptions.isProgramUser}
          >
            <UserControlBtn
              type="button"
              onClick={muteOutput}
              disabled={value === 0}
            >
              <ButtonIcon
                className={isOutputMuted || value === 0 ? "mute" : "unmuted"}
              >
                {isOutputMuted || value === 0 ? <SpeakerOff /> : <SpeakerOn />}
              </ButtonIcon>
            </UserControlBtn>
          </FlexButtonWrapper>
        )}

        {inputAudioStream &&
          inputAudioStream !== "no-device" &&
          (line?.programOutputLine
            ? joinProductionOptions?.isProgramUser
            : !joinProductionOptions.isProgramUser) && (
            <FlexButtonWrapper
              className="last"
              isProgramUser={joinProductionOptions.isProgramUser}
            >
              <UserControlBtn type="button" onClick={muteInput}>
                <ButtonIcon className={isInputMuted ? "mute" : "unmuted"}>
                  {isInputMuted ? <MicMuted /> : <MicUnmuted />}
                </ButtonIcon>
              </UserControlBtn>
            </FlexButtonWrapper>
          )}
      </FlexContainer>
    </>
  );
};
