import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { ActionButton } from "../landing-page/form-elements.tsx";
import { UserList } from "./user-list.tsx";
import {
  MicMuted,
  MicUnmuted,
  SpeakerOff,
  SpeakerOn,
  SettingsIcon,
} from "../../assets/icons/icon.tsx";
import { Spinner } from "../loader/loader.tsx";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useDeviceLabels } from "./use-device-labels.ts";
import { isMobile } from "../../bowser.ts";
import { useLineHotkeys, useSpeakerHotkeys } from "./use-line-hotkeys.ts";
import { LongPressToTalkButton } from "./long-press-to-talk-button.tsx";
import { useLinePolling } from "./use-line-polling.ts";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { useIsLoading } from "./use-is-loading.ts";
import { useCheckBadLineData } from "./use-check-bad-line-data.ts";
import { useAudioCue } from "./use-audio-cue.ts";
import { DisplayWarning } from "../display-box.tsx";
import { SettingsModal, Hotkeys } from "./settings-modal.tsx";
import { VolumeSlider } from "../volume-slider/volume-slider.tsx";
import { CallState } from "../../global-state/types.ts";
import { ExitCallButton } from "./exit-call-button.tsx";
import { Modal } from "../modal/modal.tsx";
import { VerifyDecision } from "../verify-decision/verify-decision.tsx";
import { ModalConfirmationText } from "../modal/modal-confirmation-text.ts";
import { SymphonyRtcConnectionComponent } from "./symphony-rtc-connection-component.tsx";

const TempDiv = styled.div`
  padding: 0 0 2rem 0;
`;

const HotkeyDiv = styled.div`
  padding: 0 0 2rem 0;
  flex-direction: row;
  display: flex;
  align-items: center;
`;

const HeaderWrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
`;

const SmallText = styled.span`
  font-size: 1.6rem;
`;

const ButtonIcon = styled.div`
  width: 3rem;
  display: inline-block;
  vertical-align: middle;
  margin: 0 auto;
`;

const SettingsBtn = styled.div`
  padding: 0;
  margin-left: 1.5rem;
  width: 3rem;
  cursor: pointer;
  color: white;
  background: transparent;
`;

const FlexButtonWrapper = styled.div`
  width: 50%;
  padding: 0 1rem 2rem 1rem;

  &.first {
    padding-left: 0;
  }

  &.last {
    padding-right: 0;
  }
`;

const UserControlBtn = styled(ActionButton)`
  background: rgba(50, 56, 59, 1);
  border: 0.2rem solid #6d6d6d;
  width: 100%;
`;

const LongPressWrapper = styled.div`
  margin: 0 0 2rem 0;
  touch-action: none;
`;

const ButtonWrapper = styled.span`
  margin: 0 2rem 0 0;
`;

const ListWrapper = styled(DisplayContainer)`
  width: 100%;
`;

const StateText = styled.span<{ state: string }>`
  font-weight: 700;
  color: ${({ state }) => {
    switch (state) {
      case "connected":
        return "#7be27b";
      case "failed":
        return "#f96c6c";
      default:
        return "#ddd";
    }
  }};
`;

const ConnectionErrorWrapper = styled(FlexContainer)`
  width: 100vw;
  justify-content: center;
  align-items: center;
  padding-top: 12rem;
`;

type TProductionLine = {
  id: string;
  callState: CallState;
  isSingleCall: boolean;
};

export const ProductionLine = ({
  id,
  callState,
  isSingleCall,
}: TProductionLine) => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [, dispatch] = useGlobalState();
  const [connectionActive, setConnectionActive] = useState(true);
  const [isInputMuted, setIsInputMuted] = useState(true);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [hotkeys, setHotkeys] = useState<Hotkeys>({
    muteHotkey: "m",
    speakerHotkey: "n",
    pressToTalkHotkey: "t",
    increaseVolumeHotkey: "u",
    decreaseVolumeHotkey: "d",
  });
  const [savedHotkeys, setSavedHotkeys] = useState<Hotkeys>({
    muteHotkey: "m",
    speakerHotkey: "n",
    pressToTalkHotkey: "t",
    increaseVolumeHotkey: "u",
    decreaseVolumeHotkey: "d",
  });
  const {
    joinProductionOptions,
    dominantSpeaker,
    audioLevelAboveThreshold,
    connectionState,
    audioElements,
    sessionId,
  } = callState;

  const inputAudioStream = useAudioInput({
    inputId: joinProductionOptions?.audioinput ?? null,
  });

  const muteInput = useCallback(
    (mute: boolean) => {
      if (inputAudioStream && inputAudioStream !== "no-device") {
        inputAudioStream.getTracks().forEach((t) => {
          // eslint-disable-next-line no-param-reassign
          t.enabled = !mute;
        });
        setIsInputMuted(mute);
      }
    },
    [inputAudioStream]
  );

  const { playEnterSound, playExitSound } = useAudioCue();

  const exit = useCallback(() => {
    setConnectionActive(false);
    playExitSound();
    dispatch({
      type: "REMOVE_CALL",
      payload: { id },
    });
  }, [dispatch, id, playExitSound]);

  useLineHotkeys({
    muteInput,
    isInputMuted,
    customKeyMute: savedHotkeys.muteHotkey,
    customKeyPress: savedHotkeys.pressToTalkHotkey,
  });

  useEffect(() => {
    if (connectionState === "connected") {
      playEnterSound();
    }
  }, [connectionState, playEnterSound]);

  const muteOutput = useCallback(() => {
    if (!audioElements) return;

    audioElements.forEach((singleElement: HTMLAudioElement) => {
      // eslint-disable-next-line no-param-reassign
      singleElement.muted = !isOutputMuted;
    });
    setIsOutputMuted(!isOutputMuted);
  }, [audioElements, isOutputMuted]);

  useSpeakerHotkeys({
    muteOutput,
    isOutputMuted,
    customKey: savedHotkeys.speakerHotkey,
  });

  const line = useLinePolling({ callId: id, joinProductionOptions });

  const { production, error: fetchProductionError } = useFetchProduction(
    joinProductionOptions
      ? parseInt(joinProductionOptions.productionId, 10)
      : null
  );

  useEffect(() => {
    if (!fetchProductionError) return;

    dispatch({
      type: "ERROR",
      payload: {
        error:
          fetchProductionError instanceof Error
            ? fetchProductionError
            : new Error("Error fetching production."),
      },
    });
  }, [dispatch, fetchProductionError]);

  const { loading, connectionError } = useIsLoading({ connectionState });

  const deviceLabels = useDeviceLabels({ joinProductionOptions });

  useCheckBadLineData({
    joinProductionOptions,
    paramLineId,
    paramProductionId,
    callId: id,
    dispatch,
  });

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  const saveHotkeys = () => {
    setSavedHotkeys({ ...hotkeys });
    setIsSettingsModalOpen(false);
  };

  // TODO detect if browser back button is pressed and run exit();

  return (
    <>
      <HeaderWrapper>
        {!isSingleCall && (
          <ButtonWrapper>
            <ExitCallButton resetOnExit={() => setConfirmExitModalOpen(true)} />
            {confirmExitModalOpen && (
              <Modal onClose={() => setConfirmExitModalOpen(false)}>
                <DisplayContainerHeader>Confirm</DisplayContainerHeader>
                <ModalConfirmationText>
                  Are you sure you want to leave the call?
                </ModalConfirmationText>
                <VerifyDecision
                  confirm={exit}
                  abort={() => setConfirmExitModalOpen(false)}
                />
              </Modal>
            )}
          </ButtonWrapper>
        )}

        {!loading && production && line && (
          <DisplayContainerHeader>
            <SmallText>Production:</SmallText> {production.name}{" "}
            <SmallText>Line:</SmallText> {line.name}
          </DisplayContainerHeader>
        )}
      </HeaderWrapper>

      {connectionActive && (
        <SymphonyRtcConnectionComponent
          joinProductionOptions={joinProductionOptions}
          inputAudioStream={inputAudioStream}
          callId={id}
          dispatch={dispatch}
        />
      )}

      {joinProductionOptions && connectionState && (
        <FlexContainer>
          <DisplayContainer>
            <span>
              <strong>Status</strong>:{" "}
              <StateText state={connectionState}>{connectionState}</StateText>
            </span>
          </DisplayContainer>
        </FlexContainer>
      )}

      {joinProductionOptions &&
        loading &&
        (!connectionError ? (
          <Spinner className="join-production" />
        ) : (
          <ConnectionErrorWrapper>
            <DisplayWarning
              text="Please return to previous page and try to join again."
              title="Connection failed"
            />
          </ConnectionErrorWrapper>
        ))}

      {joinProductionOptions && !loading && (
        <FlexContainer>
          <ListWrapper>
            <div
              style={{
                width: "100%",
              }}
            >
              <DisplayContainerHeader>Controls</DisplayContainerHeader>
              <FlexContainer>
                <VolumeSlider
                  audioElements={audioElements}
                  increaseVolumeKey={savedHotkeys.increaseVolumeHotkey}
                  decreaseVolumeKey={savedHotkeys.decreaseVolumeHotkey}
                />
                <FlexButtonWrapper className="first">
                  <UserControlBtn type="button" onClick={() => muteOutput()}>
                    <ButtonIcon>
                      {isOutputMuted ? <SpeakerOff /> : <SpeakerOn />}
                    </ButtonIcon>
                  </UserControlBtn>
                </FlexButtonWrapper>
                {inputAudioStream && inputAudioStream !== "no-device" && (
                  <FlexButtonWrapper className="last">
                    <UserControlBtn
                      type="button"
                      onClick={() => muteInput(!isInputMuted)}
                    >
                      <ButtonIcon>
                        {isInputMuted ? <MicMuted /> : <MicUnmuted />}
                      </ButtonIcon>
                    </UserControlBtn>
                  </FlexButtonWrapper>
                )}
              </FlexContainer>

              {inputAudioStream && inputAudioStream !== "no-device" && (
                <LongPressWrapper>
                  <LongPressToTalkButton muteInput={muteInput} />
                </LongPressWrapper>
              )}

              {deviceLabels?.inputLabel && (
                <TempDiv>
                  <strong>Audio Input:</strong> {deviceLabels.inputLabel}
                </TempDiv>
              )}

              {deviceLabels?.outputLabel && (
                <TempDiv>
                  <strong>Audio Output:</strong> {deviceLabels.outputLabel}
                </TempDiv>
              )}

              {inputAudioStream &&
                inputAudioStream !== "no-device" &&
                !isMobile && (
                  <>
                    <HotkeyDiv>
                      <strong>Hotkeys</strong>
                      <SettingsBtn onClick={handleSettingsClick}>
                        <SettingsIcon />
                      </SettingsBtn>
                    </HotkeyDiv>
                    <TempDiv>
                      <strong>{savedHotkeys.muteHotkey.toUpperCase()}: </strong>
                      Toggle Input Mute
                    </TempDiv>
                    <TempDiv>
                      <strong>
                        {savedHotkeys.speakerHotkey.toUpperCase()}:{" "}
                      </strong>
                      Toggle Output Mute
                    </TempDiv>
                    <TempDiv>
                      <strong>
                        {savedHotkeys.pressToTalkHotkey.toUpperCase()}:{" "}
                      </strong>
                      Push to Talk
                    </TempDiv>
                    <TempDiv>
                      <strong>
                        {savedHotkeys.increaseVolumeHotkey.toUpperCase()}:{" "}
                      </strong>
                      Increase Volume
                    </TempDiv>
                    <TempDiv>
                      <strong>
                        {savedHotkeys.decreaseVolumeHotkey.toUpperCase()}:{" "}
                      </strong>
                      Decrease Volume
                    </TempDiv>
                    {isSettingsModalOpen && (
                      <SettingsModal
                        hotkeys={hotkeys}
                        lineName={line?.name}
                        setHotkeys={setHotkeys}
                        onSave={saveHotkeys}
                        onClose={handleSettingsClick}
                      />
                    )}
                  </>
                )}
            </div>
          </ListWrapper>
          <ListWrapper>
            {line && (
              <UserList
                sessionId={sessionId}
                participants={line.participants}
                dominantSpeaker={dominantSpeaker}
                audioLevelAboveThreshold={audioLevelAboveThreshold}
              />
            )}
          </ListWrapper>
        </FlexContainer>
      )}
    </>
  );
};
