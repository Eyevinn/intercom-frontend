import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams } from "react-router-dom";
import { isMobile, isTablet } from "../../bowser.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { CallState } from "../../global-state/types.ts";
import { DisplayWarning } from "../display-box.tsx";
import { FlexContainer } from "../generic-components.ts";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { Spinner } from "../loader/loader.tsx";
import {
  InnerDiv,
  ProductionLines,
} from "../production-list/production-list-components.ts";
import { CallHeaderComponent } from "./call-header.tsx";
import { CollapsableSection } from "./collapsable-section.tsx";
import { ExitCallButton } from "./exit-call-button.tsx";
import { ExitCallModal } from "./exit-call-modal.tsx";
import { HotkeysComponent } from "./hotkeys-component.tsx";
import { LongPressToTalkButton } from "./long-press-to-talk-button.tsx";
import { MinifiedUserControls } from "./minified-user-controls.tsx";
import { MuteRemoteParticipantModal } from "./mute-remote-participant-modal.tsx";
import {
  ButtonWrapper,
  CallContainer,
  CallWrapper,
  ConnectionErrorWrapper,
  ListWrapper,
  LoaderWrapper,
  LongPressWrapper,
} from "./production-line-components.ts";
import { SelectDevices } from "./select-devices.tsx";
import { ShareLineButton } from "./share-line-button.tsx";
import { SymphonyRtcConnectionComponent } from "./symphony-rtc-connection-component.tsx";
import { useAudioCue } from "./use-audio-cue.ts";
import { useAudioInput } from "./use-audio-input.ts";
import { useCheckBadLineData } from "./use-check-bad-line-data.ts";
import { useIsLoading } from "./use-is-loading.ts";
import { useLineHotkeys, useSpeakerHotkeys } from "./use-line-hotkeys.ts";
import { useLinePolling } from "./use-line-polling.ts";
import { useMuteInput } from "./use-mute-input.tsx";
import { UserControls } from "./user-controls.tsx";
import { UserList } from "./user-list.tsx";

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
  const [, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const [connectionActive, setConnectionActive] = useState(true);
  const [isInputMuted, setIsInputMuted] = useState(true);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [value, setValue] = useState(0.75);
  const [hasReduced, setHasReduced] = useState(false);
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

  const increaseVolumeTimeoutRef = useRef<number | null>(null);

  const [inputAudioStream, resetAudioInput] = useAudioInput({
    audioInputId: joinProductionOptions?.audioinput ?? null,
    audioOutputId: joinProductionOptions?.audiooutput ?? null,
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
  };

  useEffect(() => {
    audioElements?.forEach((audioElement) => {
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = value;
    });

    if (value > 0) {
      setIsOutputMuted(false);
      audioElements?.forEach((audioElement) => {
        // eslint-disable-next-line no-param-reassign
        audioElement.muted = false;
      });
    }
  }, [audioElements, value]);

  useEffect(() => {
    // Reduce volume by 80%
    const volumeChangeFactor = 0.2;

    if (line?.programOutputLine) {
      if (shouldReduceVolume && !hasReduced) {
        setHasReduced(true);

        audioElements?.forEach((audioElement) => {
          // eslint-disable-next-line no-param-reassign
          audioElement.volume = value * volumeChangeFactor;
        });
      }

      if (!shouldReduceVolume && hasReduced) {
        increaseVolumeTimeoutRef.current = window.setTimeout(() => {
          audioElements?.forEach((audioElement) => {
            // eslint-disable-next-line no-param-reassign
            audioElement.volume = value;
          });
          setHasReduced(false);
        }, 2000);
      }
    }

    return () => {
      if (increaseVolumeTimeoutRef.current) {
        window.clearTimeout(increaseVolumeTimeoutRef.current);
      }
    };
  }, [
    shouldReduceVolume,
    hasReduced,
    value,
    audioElements,
    line?.programOutputLine,
  ]);

  useHotkeys(savedHotkeys?.increaseVolumeHotkey || "u", () => {
    const newValue = Math.min(value + 0.05, 1);
    setValue(newValue);
  });

  useHotkeys(savedHotkeys?.decreaseVolumeHotkey || "d", () => {
    const newValue = Math.max(value - 0.05, 0);
    setValue(newValue);
  });

  const { muteInput, inputMute } = useMuteInput({
    inputAudioStream,
    isProgramOutputLine,
    isProgramUser,
    id,
  });

  useEffect(() => {
    setIsInputMuted(inputMute);
  }, [inputMute]);

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

    if (isSingleCall) {
      navigate("/");
    }
  }, [dispatch, id, playExitSound, isSingleCall, navigate]);

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
      muteInput(masterInputMute);
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
  }, [
    dispatch,
    id,
    inputAudioStream,
    isProgramOutputLine,
    masterInputMute,
    muteInput,
  ]);

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
    <CallWrapper>
      {joinProductionOptions &&
        loading &&
        (!connectionError ? (
          <LoaderWrapper>
            <Spinner className="join-production" />
          </LoaderWrapper>
        ) : (
          <ConnectionErrorWrapper>
            <DisplayWarning
              text="Please return to previous page and try to join again."
              title="Connection failed"
            />
          </ConnectionErrorWrapper>
        ))}
      {connectionActive && (
        <SymphonyRtcConnectionComponent
          joinProductionOptions={joinProductionOptions}
          inputAudioStream={inputAudioStream}
          callId={id}
          dispatch={dispatch}
        />
      )}
      {!connectionError && !loading && (
        <CallContainer isProgramLine={line?.programOutputLine}>
          {line && (
            <CallHeaderComponent
              open={open}
              line={line}
              production={production}
              setOpen={() => setOpen(!open)}
            />
          )}
          {!open && joinProductionOptions && (
            <MinifiedUserControls
              muteOutput={muteOutput}
              muteInput={() => muteInput(!isInputMuted)}
              line={line}
              joinProductionOptions={joinProductionOptions}
              isOutputMuted={isOutputMuted}
              isInputMuted={isInputMuted}
              inputAudioStream={inputAudioStream}
              value={value}
              productionId={joinProductionOptions.productionId}
            />
          )}
          <ProductionLines className={open ? "expanded" : ""}>
            <InnerDiv>
              {joinProductionOptions && !loading && (
                <FlexContainer>
                  <ListWrapper
                    isProgramUser={isProgramUser || undefined}
                    isProgramLine={isProgramOutputLine || undefined}
                  >
                    <div
                      style={{
                        width: "100%",
                      }}
                    >
                      <UserControls
                        line={line}
                        joinProductionOptions={joinProductionOptions}
                        isOutputMuted={isOutputMuted}
                        isInputMuted={isInputMuted}
                        inputAudioStream={inputAudioStream}
                        value={value}
                        muteOutput={muteOutput}
                        muteInput={() => muteInput(!isInputMuted)}
                        handleInputChange={handleInputChange}
                      />
                      {inputAudioStream &&
                        inputAudioStream !== "no-device" &&
                        !line?.programOutputLine && (
                          <LongPressWrapper>
                            <LongPressToTalkButton muteInput={muteInput} />
                          </LongPressWrapper>
                        )}
                      <CollapsableSection title="Devices">
                        <SelectDevices
                          line={line}
                          joinProductionOptions={joinProductionOptions}
                          id={id}
                          resetAudioInput={resetAudioInput}
                          muteInput={() => muteInput(true)}
                          setConnectionActive={() => setConnectionActive(false)}
                        />
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
                      {production && line && (
                        <ButtonWrapper>
                          <ExitCallButton
                            resetOnExit={() => setConfirmExitModalOpen(true)}
                          />
                          {confirmExitModalOpen && (
                            <ExitCallModal
                              exit={exit}
                              onClose={() => setConfirmExitModalOpen(false)}
                              abort={() => setConfirmExitModalOpen(false)}
                            />
                          )}
                        </ButtonWrapper>
                      )}
                    </div>
                  </ListWrapper>
                  <ListWrapper>
                    {confirmModalOpen && (
                      <MuteRemoteParticipantModal
                        userName={userName}
                        muteError={muteError}
                        confirm={muteParticipant}
                        onClose={() => setConfirmModalOpen(false)}
                        abort={() => setConfirmModalOpen(false)}
                      />
                    )}
                  </ListWrapper>
                </FlexContainer>
              )}
              {production && line && (
                <ShareLineButton
                  productionId={production?.productionId}
                  lineId={line?.id}
                />
              )}
            </InnerDiv>
          </ProductionLines>
        </CallContainer>
      )}
    </CallWrapper>
  );
};
