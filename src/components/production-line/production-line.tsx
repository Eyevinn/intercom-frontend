import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { UserList } from "./user-list.tsx";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MicMuted,
  MicUnmuted,
  SpeakerOff,
  SpeakerOn,
  TVIcon,
  UsersIcon,
} from "../../assets/icons/icon.tsx";
import {
  ActionButton,
  DecorativeLabel,
  FormLabel,
  FormContainer,
  FormSelect,
  StyledWarningMessage,
} from "../landing-page/form-elements.tsx";
import { Spinner } from "../loader/loader.tsx";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
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
import { HotkeysComponent } from "./hotkeys-component.tsx";
import { CollapsableSection } from "./collapsable-section.tsx";
import {
  HeaderIcon,
  HeaderTexts,
  HeaderWrapper,
  InnerDiv,
  ParticipantCount,
  ProductionItemWrapper,
  ProductionLines,
  ProductionName,
} from "../production-list/production-list-components.ts";

type FormValues = TJoinProductionOptions;

const CallInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const ButtonIcon = styled.div`
  width: 3rem;
  display: inline-block;
  vertical-align: middle;
  margin: 0 auto;

  &.mute {
    svg {
      fill: #f96c6c;
    }
  }

  &.unmuted {
    svg {
      fill: #6fd84f;
    }
  }
`;

const FlexButtonWrapper = styled.div<{ isProgramUser: boolean }>`
  width: 50%;
  padding: 0 1rem 1rem 1rem;

  &.first {
    padding-left: 0;
  }

  &.last {
    padding-right: 0;
    padding-left: ${({ isProgramUser }) => (isProgramUser ? "0" : "1rem")};
  }
`;

const UserControlBtn = styled(ActionButton)`
  background: rgba(50, 56, 59, 1);
  border: 0.2rem solid #6d6d6d;
  width: 100%;

  &:disabled {
    background: rgba(50, 56, 59, 0.5);
  }

  svg {
    width: 2rem;
  }
`;

const LongPressWrapper = styled.div`
  touch-action: none;
`;

const PTTWrapper = styled(LongPressWrapper)`
  width: 100%;
  button {
    padding: 1rem;
    line-height: 2rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ListWrapper = styled(DisplayContainer)`
  width: 100%;
  padding: 0;
`;

const ConnectionErrorWrapper = styled(FlexContainer)`
  width: 100vw;
  justify-content: center;
  align-items: center;
  padding-top: 12rem;
`;

const ProgramOutputIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(50, 56, 59, 1);
  color: #59cbe8;
  border: 0.2rem solid #6d6d6d;
  padding: 0.5rem 1rem;
  width: fit-content;
  height: 4rem;
  border-radius: 0.5rem;
  margin: 0 2rem 2rem 1rem;
  gap: 1rem;
  font-size: 1.2rem;

  svg {
    fill: #59cbe8;
    width: 2.5rem;
  }
`;

const DeviceButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    margin: 0;
  }

  .save-button {
    margin-right: 1rem;
  }
`;

const SpinnerWrapper = styled.div`
  margin-top: 2rem;
`;

const CallWrapper = styled(ProductionItemWrapper)<{ isProgramLine?: boolean }>`
  margin: 0 0 2rem 0;
  background: ${({ isProgramLine }) =>
    isProgramLine ? "rgba(73, 67, 124, 0.2)" : "transparent"};
`;

const CallHeader = styled(HeaderWrapper)``;

const MinifiedControls = styled.div`
  padding: 0 2rem 2rem 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  button {
    margin: 0;
  }
`;

const MinifiedControlsBlock = styled.div`
  width: 50%;
  display: flex;
  gap: 1rem;
`;

const MinifiedControlsButton = styled(UserControlBtn)`
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: white;
  line-height: 2rem;
  &.off {
    svg {
      fill: #f96c6c;
    }
  }

  &.on {
    svg {
      fill: #6fd84f;
    }
  }
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
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [value, setValue] = useState(0.75);
  const [hasReduced, setHasReduced] = useState(false);
  const [baseVolume, setBaseVolume] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [muteError, setMuteError] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState<boolean>(!isMobile);
  const {
    joinProductionOptions,
    dominantSpeaker,
    audioLevelAboveThreshold,
    connectionState,
    audioElements,
    sessionId,
    hotkeys: savedHotkeys,
    dataChannel,
    isRemotelyMuted,
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
  const finalIncreaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef<boolean>(false);

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

  const line = useLinePolling({ callId: id, joinProductionOptions });
  const isProgramOutputLine = line && line.programOutputLine;
  const isProgramUser =
    joinProductionOptions && joinProductionOptions.isProgramUser;

  const { production, error: fetchProductionError } = useFetchProduction(
    joinProductionOptions
      ? parseInt(joinProductionOptions.productionId, 10)
      : null
  );

  const muteInput = useCallback(
    (mute: boolean) => {
      if (inputAudioStream && inputAudioStream !== "no-device") {
        inputAudioStream.getTracks().forEach((t) => {
          if (isProgramOutputLine && !isProgramUser) {
            // eslint-disable-next-line no-param-reassign
            t.enabled = false;
          } else {
            // eslint-disable-next-line no-param-reassign
            t.enabled = !mute;
          }
        });
        setIsInputMuted(mute);
      }
      if (mute) {
        dispatch({
          type: "UPDATE_CALL",
          payload: {
            id,
            updates: {
              isRemotelyMuted: false,
            },
          },
        });
      }
    },
    [dispatch, id, inputAudioStream, isProgramOutputLine, isProgramUser]
  );

  useEffect(() => {
    if (!confirmModalOpen) {
      setMuteError(false);
    }
  }, [confirmModalOpen]);

  useEffect(() => {
    if (isRemotelyMuted && !isProgramOutputLine) {
      muteInput(true);
    }
  }, [isProgramOutputLine, isRemotelyMuted, muteInput]);

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

  useEffect(() => {
    if (joinProductionOptions) {
      setConnectionActive(true);
    }
  }, [joinProductionOptions]);

  useEffect(() => {
    if (
      inputAudioStream &&
      inputAudioStream !== "no-device" &&
      !isProgramOutputLine
    ) {
      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !masterInputMute;
      });
      setIsInputMuted(masterInputMute);
    }
    if (masterInputMute && !isProgramOutputLine) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            isRemotelyMuted: false,
          },
        },
      });
    }
  }, [dispatch, id, inputAudioStream, isProgramOutputLine, masterInputMute]);

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

  useEffect(() => {
    if (isProgramOutputLine && isProgramUser) {
      setIsOutputMuted(true);
    }
  }, [isProgramOutputLine, isProgramUser]);

  // MÅSTE MUTEA SPEAKER PÅ PROGRAM LINE!!!!!

  useEffect(() => {
    // Reduce volume by 80%
    const volumeChangeFactor = 0.2;

    if (!line?.programOutputLine) return;

    if (shouldReduceVolume && !hasReduced) {
      setBaseVolume(value);
      setHasReduced(true);

      audioElements?.forEach((audioElement) => {
        // eslint-disable-next-line no-param-reassign
        audioElement.volume *= volumeChangeFactor;
        console.log("VOLUME REDUCTION: ", audioElement.volume);
      });
    }

    console.log("IF ONE !isAudioActive: ", !shouldReduceVolume);
    console.log("IF TWO hasReduced: ", hasReduced);
    console.log("IF THREE !isRunning: ", !isRunningRef.current);

    if (!shouldReduceVolume && hasReduced && !isRunningRef.current) {
      isRunningRef.current = true;
      if (baseVolume === null) {
        return;
      }

      console.log("BASE VOLUME: ", baseVolume);

      console.log(
        "FINAL INCREASE TIMEOUT REF: ",
        finalIncreaseTimeoutRef.current
      );

      finalIncreaseTimeoutRef.current = setTimeout(() => {
        console.log("LINDA");
        audioElements?.forEach((audioElement) => {
          console.log("SANDRA INSIDE SECOND INCREASE");
          // eslint-disable-next-line no-param-reassign
          audioElement.volume = baseVolume;
          console.log("VOLUME STEP 3: ", audioElement.volume);
        });
        setHasReduced(false);
        isRunningRef.current = false;
      }, 3000);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (finalIncreaseTimeoutRef.current) {
        clearTimeout(finalIncreaseTimeoutRef.current);
      }
    };
  }, [
    shouldReduceVolume,
    baseVolume,
    hasReduced,
    value,
    audioElements,
    line?.programOutputLine,
  ]);

  useEffect(() => {
    audioElements?.forEach((audioElement) => {
      console.log("AUDIO ELEMENT VOLUME: ", audioElement.volume);
    });
  }, [audioElements]);

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

  useCheckBadLineData({
    joinProductionOptions,
    paramLineId,
    paramProductionId,
    callId: id,
    dispatch,
  });

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
    }
  };

  const muteParticipant = () => {
    const msg = JSON.stringify({
      type: "EndpointMessage",
      to: userId,
      payload: {
        muteParticipant: "mute",
      },
    });

    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(msg);
      setMuteError(false);
      setConfirmModalOpen(false);
    } else {
      setMuteError(true);
      console.error("Data channel is not open.");
    }
  };

  // TODO detect if browser back button is pressed and run exit();

  return (
    <CallWrapper isProgramLine={line?.programOutputLine}>
      {joinProductionOptions &&
        loading &&
        (!connectionError ? (
          <SpinnerWrapper>
            <Spinner className="join-production" />
          </SpinnerWrapper>
        ) : (
          <ConnectionErrorWrapper>
            <DisplayWarning
              text="Please return to previous page and try to join again."
              title="Connection failed"
            />
          </ConnectionErrorWrapper>
        ))}
      {line && (
        <CallHeader onClick={() => setOpen(!open)}>
          <HeaderTexts
            className={(line?.participants.length || 0) > 0 ? "active" : ""}
          >
            <ProductionName>{`${production?.name}/${line?.name}`}</ProductionName>
            <UsersIcon />
            <ParticipantCount>{line?.participants.length}</ParticipantCount>
          </HeaderTexts>
          <HeaderIcon>
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HeaderIcon>
        </CallHeader>
      )}
      {!open && joinProductionOptions && (
        <MinifiedControls>
          <MinifiedControlsBlock>
            {line &&
              !(
                line?.programOutputLine && joinProductionOptions.isProgramUser
              ) && (
                <MinifiedControlsButton
                  className={isOutputMuted ? "off" : "on"}
                  onClick={() => setIsOutputMuted(!isOutputMuted)}
                >
                  {isOutputMuted || value === 0 ? (
                    <SpeakerOff />
                  ) : (
                    <SpeakerOn />
                  )}
                </MinifiedControlsButton>
              )}
            {inputAudioStream &&
              inputAudioStream !== "no-device" &&
              (line?.programOutputLine
                ? joinProductionOptions?.isProgramUser
                : !joinProductionOptions.isProgramUser) && (
                <MinifiedControlsButton
                  className={isInputMuted ? "off" : "on"}
                  onClick={() => muteInput(!isInputMuted)}
                >
                  {isInputMuted ? <MicMuted /> : <MicUnmuted />}
                </MinifiedControlsButton>
              )}
          </MinifiedControlsBlock>
          <MinifiedControlsBlock>
            {inputAudioStream &&
              inputAudioStream !== "no-device" &&
              !line?.programOutputLine && (
                <PTTWrapper>
                  <LongPressToTalkButton
                    muteInput={muteInput}
                    text="Push To Talk"
                  />
                </PTTWrapper>
              )}
          </MinifiedControlsBlock>
        </MinifiedControls>
      )}
      <ProductionLines className={open ? "expanded" : ""}>
        <InnerDiv>
          <CallInfo>
            {line?.programOutputLine && (
              <ProgramOutputIcon>
                <TVIcon />
                Audio feed
              </ProgramOutputIcon>
            )}
          </CallInfo>

          {connectionActive && (
            <SymphonyRtcConnectionComponent
              joinProductionOptions={joinProductionOptions}
              inputAudioStream={inputAudioStream}
              callId={id}
              dispatch={dispatch}
            />
          )}

          {joinProductionOptions && !loading && (
            <FlexContainer>
              <ListWrapper>
                <div
                  style={{
                    width: "100%",
                  }}
                >
                  {!isIOSMobile &&
                    !isIpad &&
                    !(
                      line?.programOutputLine &&
                      joinProductionOptions.isProgramUser
                    ) && (
                      <VolumeSlider
                        value={value}
                        handleInputChange={handleInputChange}
                      />
                    )}
                  <FlexContainer>
                    {!(
                      line?.programOutputLine &&
                      joinProductionOptions.isProgramUser
                    ) && (
                      <FlexButtonWrapper
                        className="first"
                        isProgramUser={joinProductionOptions.isProgramUser}
                      >
                        <UserControlBtn
                          type="button"
                          onClick={() => muteOutput()}
                          disabled={value === 0}
                        >
                          <ButtonIcon
                            className={isOutputMuted ? "mute" : "unmuted"}
                          >
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
                        <FlexButtonWrapper
                          className="last"
                          isProgramUser={joinProductionOptions.isProgramUser}
                        >
                          <UserControlBtn
                            type="button"
                            onClick={() => muteInput(!isInputMuted)}
                          >
                            <ButtonIcon
                              className={isInputMuted ? "mute" : "unmuted"}
                            >
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
                  <CollapsableSection title="Devices">
                    <FormContainer>
                      {devices &&
                        (line?.programOutputLine
                          ? joinProductionOptions.isProgramUser
                          : !joinProductionOptions.isProgramUser) && (
                          <FormLabel>
                            <DecorativeLabel>Input</DecorativeLabel>
                            <FormSelect
                              // eslint-disable-next-line
                              {...register(`audioinput`)}
                            >
                              {devices.input && devices.input.length > 0 ? (
                                devices.input.map((device) => (
                                  <option
                                    key={device.deviceId}
                                    value={device.deviceId}
                                  >
                                    {device.label}
                                  </option>
                                ))
                              ) : (
                                <option value="no-device">
                                  No device available
                                </option>
                              )}
                            </FormSelect>
                          </FormLabel>
                        )}
                      {!(
                        line?.programOutputLine &&
                        joinProductionOptions.isProgramUser
                      ) && (
                        <FormLabel>
                          <DecorativeLabel>Output</DecorativeLabel>
                          {devices.output && devices.output.length > 0 ? (
                            <FormSelect
                              // eslint-disable-next-line
                              {...register(`audiooutput`)}
                            >
                              {devices.output.map((device) => (
                                <option
                                  key={device.deviceId}
                                  value={device.deviceId}
                                >
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
                      )}
                      {isBrowserFirefox && !isMobile && (
                        <StyledWarningMessage>
                          If a new device has been added Firefox needs the
                          permission to be manually reset. If your device is
                          missing, please remove the permission and reload page.
                        </StyledWarningMessage>
                      )}
                      <DeviceButtonWrapper>
                        <ActionButton
                          type="submit"
                          className="save-button"
                          disabled={audioNotChanged || !isValid || !isDirty}
                          onClick={handleSubmit(onSubmit)}
                        >
                          Save
                        </ActionButton>
                        {!(isBrowserFirefox && !isMobile) && (
                          <ReloadDevicesButton />
                        )}
                      </DeviceButtonWrapper>
                    </FormContainer>
                  </CollapsableSection>
                  {inputAudioStream &&
                    inputAudioStream !== "no-device" &&
                    !isMobile &&
                    !isTablet && (
                      <CollapsableSection title="Hotkeys">
                        <HotkeysComponent
                          callId={id}
                          savedHotkeys={savedHotkeys}
                          customGlobalMute={customGlobalMute}
                          line={line}
                          joinProductionOptions={joinProductionOptions}
                        />
                      </CollapsableSection>
                    )}
                  <CollapsableSection title="Participants">
                    {line && (
                      <UserList
                        sessionId={sessionId}
                        participants={line.participants}
                        dominantSpeaker={dominantSpeaker}
                        audioLevelAboveThreshold={audioLevelAboveThreshold}
                        programOutputLine={line.programOutputLine}
                        setConfirmModalOpen={setConfirmModalOpen}
                        setUserId={setUserId}
                        setUserName={setUserName}
                      />
                    )}
                  </CollapsableSection>
                  {!isSingleCall && production && line && (
                    <ButtonWrapper>
                      <ExitCallButton
                        resetOnExit={() => setConfirmExitModalOpen(true)}
                      />
                      {confirmExitModalOpen && (
                        <Modal onClose={() => setConfirmExitModalOpen(false)}>
                          <DisplayContainerHeader>
                            Confirm
                          </DisplayContainerHeader>
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
                </div>
              </ListWrapper>
              <ListWrapper>
                {confirmModalOpen && (
                  <Modal onClose={() => setConfirmModalOpen(false)}>
                    <DisplayContainerHeader>Confirm</DisplayContainerHeader>
                    <ModalConfirmationText>
                      {muteError
                        ? "Something went wrong, Please try again"
                        : `Are you sure you want to mute ${userName}?`}
                    </ModalConfirmationText>
                    <ModalConfirmationText className="bold">
                      {muteError
                        ? ""
                        : `This will mute ${userName} for everyone in the call.`}
                    </ModalConfirmationText>
                    <VerifyDecision
                      confirm={muteParticipant}
                      abort={() => setConfirmModalOpen(false)}
                    />
                  </Modal>
                )}
              </ListWrapper>
            </FlexContainer>
          )}
        </InnerDiv>
      </ProductionLines>
    </CallWrapper>
  );
};
