import {
  MicMuted,
  MicUnmuted,
  SpeakerOff,
  SpeakerOn,
} from "../../assets/icons/icon";
import { GenerateWhipUrlButton } from "../generate-urls/generate-whip-url/generate-whip-url-button";
import { ShareLineButton } from "../generate-urls/share-line-link/share-line-button";
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
  muteOutput,
  muteInput,
  onStartTalking,
  onStopTalking,
  isTalking,
  line,
  joinProductionOptions,
  isOutputMuted,
  isInputMuted,
  inputAudioStream,
  value,
  productionId,
}: {
  muteOutput: () => void;
  muteInput: () => void;
  onStartTalking: () => void;
  onStopTalking: () => void;
  isTalking: boolean;
  line: TLine | null;
  joinProductionOptions: TJoinProductionOptions;
  isOutputMuted: boolean;
  isInputMuted: boolean;
  inputAudioStream: TUseAudioInputValues;
  value: number;
  productionId: string;
}) => {
  return (
    <MinifiedControls>
      <MinifiedControlsBlock>
        {line &&
          !(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
            <MinifiedControlsButton
              className={isOutputMuted || value === 0 ? "off" : "on"}
              onClick={muteOutput}
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
                onStartTalking={onStartTalking}
                onStopTalking={onStopTalking}
                isTalking={isTalking}
              />
            </PTTWrapper>
          </MinifiedControlsBlock>
        )}
      {line && (
        <>
          <ShareLineButton
            isMinified
            productionId={productionId}
            lineId={line.id}
          />
          <GenerateWhipUrlButton
            isMinified
            productionId={productionId}
            lineId={line.id}
          />
        </>
      )}
    </MinifiedControls>
  );
};
