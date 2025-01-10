import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { UserList } from "./user-list.tsx";
import {
  MicMuted,
  MicUnmuted,
  SpeakerOff,
  SpeakerOn,
  TVIcon,
} from "../../assets/icons/icon.tsx";
import {
  ActionButton,
  DecorativeLabel,
  FormLabel,
  FormContainer,
  FormSelect,
  PrimaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements.tsx";
import { Spinner } from "../loader/loader.tsx";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useDeviceLabels } from "./use-device-labels.ts";
import {
  isBrowserFirefox,
  isMobile,
  isIOSMobile,
  isIpad,
  isTablet,
} from "../../bowser.ts";
import { useLineHotkeys, useSpeakerHotkeys } from "./use-line-hotkeys.ts";
import { LongPressToTalkButton } from "./long-press-to-talk-button.tsx";
import { useLinePolling } from "./use-line-polling.ts";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { useIsLoading } from "./use-is-loading.ts";
import { useCheckBadLineData } from "./use-check-bad-line-data.ts";
import { useAudioCue } from "./use-audio-cue.ts";
import { DisplayWarning } from "../display-box.tsx";
import { TJoinProductionOptions } from "./types.ts";
import { VolumeSlider } from "../volume-slider/volume-slider.tsx";
import { CallState } from "../../global-state/types.ts";
import { ExitCallButton } from "./exit-call-button.tsx";
import { Modal } from "../modal/modal.tsx";
import { VerifyDecision } from "../verify-decision/verify-decision.tsx";
import { ModalConfirmationText } from "../modal/modal-confirmation-text.ts";
import { SymphonyRtcConnectionComponent } from "./symphony-rtc-connection-component.tsx";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button.tsx";
import { useFetchDevices } from "../../hooks/use-fetch-devices.ts";
import { HotkeysComponent } from "./hotkeys-component.tsx";

type FormValues = TJoinProductionOptions;

const TempDiv = styled.div`
  padding: 0 0 2rem 0;
`;

const HeaderWrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const SmallText = styled.span`
  font-size: 1.6rem;
`;

const LargeText = styled.span`
  word-break: break-all;
`;

const ButtonIcon = styled.div`
  width: 3rem;
  display: inline-block;
  vertical-align: middle;
  margin: 0 auto;
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

  &:disabled {
    background: rgba(50, 56, 59, 0.5);
  }
`;

const LongPressWrapper = styled.div`
  margin: 0 0 2rem 0;
  touch-action: none;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 2rem 2rem 1rem;
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

const IconWrapper = styled.div`
  width: 5rem;
  height: 5rem;
  margin-left: 2rem;
`;

type TProductionLine = {
  id: string;
  callState: CallState;
  isSingleCall: boolean;
  customGlobalMute: string;
  masterInputMute: boolean;
  shouldReduceVolume: boolean;
};

export const ProductionLine = ({
  id,
  callState,
  isSingleCall,
  customGlobalMute,
  masterInputMute,
  shouldReduceVolume,
}: TProductionLine) => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [{ devices }, dispatch] = useGlobalState();
  const [connectionActive, setConnectionActive] = useState(true);
  const [isInputMuted, setIsInputMuted] = useState(true);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [value, setValue] = useState(0.75);
  const [hasReduced, setHasReduced] = useState(false);
  const {
    joinProductionOptions,
    dominantSpeaker,
    audioLevelAboveThreshold,
    connectionState,
    audioElements,
    sessionId,
    hotkeys: savedHotkeys,
  } = callState;

  const {
    formState: { isValid, isDirty },
    register,
    handleSubmit,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      productionId: paramProductionId || "",
      lineId: paramLineId || undefined,
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  // Watch all form values
  const watchedValues = watch();
  const audioInputTheSame =
    joinProductionOptions?.audioinput === watchedValues.audioinput;
  const audioOutputTheSame =
    joinProductionOptions?.audiooutput === watchedValues.audiooutput;
  const audioNotChanged = audioInputTheSame && audioOutputTheSame;

  const [inputAudioStream, resetAudioInput] = useAudioInput({
    audioInputId: joinProductionOptions?.audioinput ?? null,
    audioOutputId: joinProductionOptions?.audiooutput ?? null,
  });

  useEffect(() => {
    if (audioElements) {
      audioElements.forEach((audioElement) => {
        if (audioElement.volume !== 0.75) {
          // eslint-disable-next-line no-param-reassign
          audioElement.volume = 0.75;
        }
      });
    }
  }, [audioElements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);

    audioElements?.forEach((audioElement) => {
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = newValue;
    });

    if (newValue > 0 && isOutputMuted) {
      setIsOutputMuted(false);
      audioElements?.forEach((audioElement) => {
        // eslint-disable-next-line no-param-reassign
        audioElement.muted = false;
      });
    }
  };

  useHotkeys(savedHotkeys?.increaseVolumeHotkey || "u", () => {
    const newValue = Math.min(value + 0.05, 1);
    setValue(newValue);

    audioElements?.forEach((audioElement) => {
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = newValue;
    });
  });

  useHotkeys(savedHotkeys?.decreaseVolumeHotkey || "d", () => {
    const newValue = Math.max(value - 0.05, 0);
    setValue(newValue);

    audioElements?.forEach((audioElement) => {
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = newValue;
    });

    if (newValue > 0 && isOutputMuted) {
      setIsOutputMuted(false);
    }
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
    customKeyMute: savedHotkeys?.muteHotkey || "m",
    customKeyPress: savedHotkeys?.pushToTalkHotkey || "t",
  });

  const [refresh] = useFetchDevices({
    dispatch,
    permission: true,
  });

  useEffect(() => {
    if (joinProductionOptions) {
      setConnectionActive(true);
    }
  }, [joinProductionOptions]);

  useEffect(() => {
    if (inputAudioStream && inputAudioStream !== "no-device") {
      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !masterInputMute;
      });
      setIsInputMuted(masterInputMute);
    }
  }, [inputAudioStream, masterInputMute]);

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
    customKey: savedHotkeys?.speakerHotkey || "n",
  });

  const line = useLinePolling({ callId: id, joinProductionOptions });

  const { production, error: fetchProductionError } = useFetchProduction(
    joinProductionOptions
      ? parseInt(joinProductionOptions.productionId, 10)
      : null
  );

  useEffect(() => {
    let volumeReductionTimeout: NodeJS.Timeout;
    let volumeIncreaseTimeout: NodeJS.Timeout;
    const volumeChangeFactor = 0.2;

    if (shouldReduceVolume && line?.programOutputLine && !hasReduced) {
      volumeReductionTimeout = setTimeout(() => {
        setValue((prevValue) => prevValue * volumeChangeFactor);
        setHasReduced(true);

        audioElements?.forEach((audioElement) => {
          // eslint-disable-next-line no-param-reassign
          audioElement.volume *= volumeChangeFactor;
        });
      }, 1000);

      return () => clearTimeout(volumeReductionTimeout);
    }

    if (!shouldReduceVolume && line?.programOutputLine && hasReduced) {
      volumeIncreaseTimeout = setTimeout(() => {
        setValue((prevValue) => prevValue / volumeChangeFactor);
        setHasReduced(false);

        audioElements?.forEach((audioElement) => {
          // eslint-disable-next-line no-param-reassign
          audioElement.volume /= volumeChangeFactor;
        });
      }, 3000);

      return () => clearTimeout(volumeIncreaseTimeout);
    }

    return () => {
      clearTimeout(volumeReductionTimeout);
      clearTimeout(volumeIncreaseTimeout);
    };
  }, [shouldReduceVolume, hasReduced, line?.programOutputLine, audioElements]);

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

  const settingsButtonPressed = () => {
    refresh();
    setShowDeviceSettings(!showDeviceSettings);
  };

  // Reset connection and re-connect to production-line
  const onSubmit: SubmitHandler<FormValues> = async (payload) => {
    if (joinProductionOptions && !audioNotChanged) {
      setConnectionActive(false);
      resetAudioInput();
      muteInput(true);

      const newJoinProductionOptions = {
        ...payload,
        productionId: joinProductionOptions.productionId,
        lineId: joinProductionOptions.lineId,
        username: joinProductionOptions.username,
      };

      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            joinProductionOptions: newJoinProductionOptions,
            mediaStreamInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            sessionId: null,
          },
        },
      });

      setShowDeviceSettings(false);
    }
  };

  // TODO detect if browser back button is pressed and run exit();

  return (
    <>
      <HeaderWrapper>
        {!isSingleCall && (
          <ButtonWrapper>
            <ExitCallButton resetOnExit={() => setConfirmExitModalOpen(true)} />
            {line?.programOutputLine && (
              <IconWrapper>
                <TVIcon />
              </IconWrapper>
            )}
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
            <SmallText>Production:</SmallText>
            <LargeText>{production.name} </LargeText>
            <SmallText>Line:</SmallText>
            <LargeText>{line.name}</LargeText>
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
              {!isIOSMobile &&
                !isIpad &&
                !(
                  line?.programOutputLine && joinProductionOptions.isProgramUser
                ) && (
                  <VolumeSlider
                    value={value}
                    handleInputChange={handleInputChange}
                  />
                )}
              <FlexContainer>
                {!(
                  line?.programOutputLine && joinProductionOptions.isProgramUser
                ) && (
                  <FlexButtonWrapper className="first">
                    <UserControlBtn
                      type="button"
                      onClick={() => muteOutput()}
                      disabled={value === 0}
                    >
                      <ButtonIcon>
                        {isOutputMuted || value === 0 ? (
                          <SpeakerOff />
                        ) : (
                          <SpeakerOn />
                        )}
                      </ButtonIcon>
                    </UserControlBtn>
                  </FlexButtonWrapper>
                )}
                {inputAudioStream &&
                  inputAudioStream !== "no-device" &&
                  (line?.programOutputLine
                    ? joinProductionOptions?.isProgramUser
                    : !joinProductionOptions.isProgramUser) && (
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

              {inputAudioStream &&
                inputAudioStream !== "no-device" &&
                !line?.programOutputLine && (
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
              <FlexButtonWrapper>
                <PrimaryButton
                  type="button"
                  onClick={() => settingsButtonPressed()}
                >
                  {!showDeviceSettings ? "Change device" : "Close"}
                </PrimaryButton>
              </FlexButtonWrapper>
              {showDeviceSettings && devices && (
                <FormContainer>
                  <FormLabel>
                    <DecorativeLabel>Input</DecorativeLabel>
                    <FormSelect
                      // eslint-disable-next-line
                      {...register(`audioinput`)}
                    >
                      {devices.input && devices.input.length > 0 ? (
                        devices.input.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </option>
                        ))
                      ) : (
                        <option value="no-device">No device available</option>
                      )}
                    </FormSelect>
                  </FormLabel>
                  <FormLabel>
                    <DecorativeLabel>Output</DecorativeLabel>
                    {devices.output && devices.output.length > 0 ? (
                      <FormSelect
                        // eslint-disable-next-line
                        {...register(`audiooutput`)}
                      >
                        {devices.output.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </option>
                        ))}
                      </FormSelect>
                    ) : (
                      <StyledWarningMessage>
                        Controlled by operating system
                      </StyledWarningMessage>
                    )}
                  </FormLabel>
                  {isBrowserFirefox && !isMobile && (
                    <StyledWarningMessage>
                      If a new device has been added Firefox needs the
                      permission to be manually reset. If your device is
                      missing, please remove the permission and reload page.
                    </StyledWarningMessage>
                  )}
                  <ButtonWrapper>
                    <ActionButton
                      type="submit"
                      disabled={audioNotChanged || !isValid || !isDirty}
                      onClick={handleSubmit(onSubmit)}
                    >
                      Save
                    </ActionButton>
                    {!(isBrowserFirefox && !isMobile) && (
                      <ReloadDevicesButton />
                    )}
                  </ButtonWrapper>
                </FormContainer>
              )}

              {inputAudioStream &&
                inputAudioStream !== "no-device" &&
                !isMobile &&
                !isTablet && (
                  <HotkeysComponent
                    callId={id}
                    savedHotkeys={savedHotkeys}
                    customGlobalMute={customGlobalMute}
                    line={line}
                    joinProductionOptions={joinProductionOptions}
                  />
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
