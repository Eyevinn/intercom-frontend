import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams } from "react-router-dom";
import { isBrowserFirefox, isMobile, isTablet } from "../../bowser.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { CallState } from "../../global-state/types.ts";
import { useCallActionHandlers } from "../../hooks/use-call-action-handlers.ts";
import { CallData } from "../../hooks/use-call-list.ts";
import { usePushToTalk } from "../../hooks/use-push-to-talk.ts";
import logger from "../../utils/logger.ts";
import { DisplayWarning } from "../display-box.tsx";
import { GenerateWhipUrlButton } from "../generate-urls/generate-whip-url/generate-whip-url-button.tsx";
import { ShareLineButton } from "../generate-urls/share-line-link/share-line-button.tsx";
import { FlexContainer } from "../generic-components.ts";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { Spinner } from "../loader/loader.tsx";
import { ExpandableSection, InnerDiv } from "../shared/shared-components.ts";
import { ConfirmationModal } from "../verify-decision/confirmation-modal.tsx";
import { CallHeaderComponent } from "./call-header.tsx";
import { CollapsableSection } from "./collapsable-section.tsx";
import { ExitCallButton } from "./exit-call-button.tsx";
import { HotkeysComponent } from "./hotkeys-component.tsx";
import { LongPressToTalkButton } from "./long-press-to-talk-button.tsx";
import { MinifiedUserControls } from "./minified-user-controls.tsx";
import {
  ButtonWrapper,
  CallContainer,
  CallWrapper,
  ConnectionErrorWrapper,
  ListWrapper,
  LoaderWrapper,
  LongPressWrapper,
  UrlButtonsWrapper,
} from "./production-line-components.ts";
import { SelectDevices } from "./select-devices.tsx";
import { SymphonyRtcConnectionComponent } from "./symphony-rtc-connection-component.tsx";
import { useActiveParticipant } from "./use-active-participant.tsx";
import { useAudioCue } from "./use-audio-cue.ts";
import { useAudioInput } from "./use-audio-input.ts";
import { useCheckBadLineData } from "./use-check-bad-line-data.ts";
import { useIsLoading } from "./use-is-loading.ts";
import { useLineHotkeys, useSpeakerHotkeys } from "./use-line-hotkeys.ts";
import { useLinePolling } from "./use-line-polling.ts";
import { useMasterInputMute } from "./use-master-input-mute.ts";
import { useMuteInput } from "./use-mute-input.tsx";
import { useUpdateCallDevice } from "./use-update-call-device.tsx";
import { useVolumeReducer } from "./use-volume-reducer.tsx";
import { UserControls } from "./user-controls.tsx";
import { UserList } from "./user-list.tsx";

type TProductionLine = {
  id: string;
  callState: CallState;
  isSingleCall: boolean;
  customGlobalMute: string;
  masterInputMute: boolean;
  shouldReduceVolume: boolean;
  isSettingGlobalMute?: boolean;
  callActionHandlers: React.MutableRefObject<
    Record<string, Record<string, () => void>>
  >;
  setFailedToConnect: () => void;
  registerCallList: (
    callId: string,
    data: CallData,
    isSettingGlobalMute?: boolean
  ) => void;
  deregisterCall?: (callId: string) => void;
};

export const ProductionLine = ({
  id,
  callState,
  isSingleCall,
  customGlobalMute,
  masterInputMute,
  shouldReduceVolume,
  isSettingGlobalMute,
  callActionHandlers,
  setFailedToConnect,
  registerCallList,
  deregisterCall,
}: TProductionLine) => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const [connectionActive, setConnectionActive] = useState(true);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [value, setValue] = useState(0.75);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [muteError, setMuteError] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState<boolean>(!isMobile);
  const {
    joinProductionOptions,
    audiooutput,
    dominantSpeaker,
    audioLevelAboveThreshold,
    connectionState,
    audioElements,
    sessionId,
    hotkeys: savedHotkeys,
    dataChannel,
    isRemotelyMuted,
  } = callState;
  const { isActiveParticipant } = useActiveParticipant(
    audioLevelAboveThreshold
  );

  const [inputAudioStream, audioInputError, resetAudioInput] = useAudioInput({
    audioInputId: joinProductionOptions?.audioinput ?? null,
    dispatch,
  });

  useEffect(() => {
    if (audioInputError) {
      setConnectionActive(false);
      setFailedToConnect();
      dispatch({
        type: "REMOVE_CALL",
        payload: { id },
      });

      if (isSingleCall) {
        navigate("/");
      }
    }
  }, [
    audioInputError,
    dispatch,
    id,
    isSingleCall,
    navigate,
    setFailedToConnect,
  ]);

  const line = useLinePolling({ callId: id, joinProductionOptions });
  const isProgramOutputLine = line && line.programOutputLine;
  const isProgramUser =
    joinProductionOptions && joinProductionOptions.isProgramUser;

  const lineParticipant = useMemo(
    () =>
      line?.participants.find((p) => p.sessionId === callState.sessionId)
        ?.endpointId,
    [line?.participants, callState.sessionId]
  );

  const isSelfDominantSpeaker = lineParticipant === dominantSpeaker;

  const { production, error: fetchProductionError } = useFetchProduction(
    joinProductionOptions
      ? parseInt(joinProductionOptions.productionId, 10)
      : null
  );

  const { muteInput, isInputMuted } = useMuteInput({
    inputAudioStream,
    isProgramOutputLine,
    isProgramUser,
    id,
  });

  useVolumeReducer({
    line,
    audioElements,
    shouldReduceVolume,
    value,
  });

  useEffect(() => {
    registerCallList(
      id,
      {
        isInputMuted,
        isOutputMuted,
        volume: value,
        lineId: joinProductionOptions?.lineId || line?.id || "",
        lineName: joinProductionOptions?.lineName || line?.name || "",
        productionId:
          joinProductionOptions?.productionId || production?.productionId || "",
        productionName:
          joinProductionOptions?.productionName || production?.name || "",
        isProgramOutputLine:
          joinProductionOptions?.lineUsedForProgramOutput ||
          isProgramOutputLine ||
          false,
        isProgramUser: joinProductionOptions?.isProgramUser || false,
      },
      isSettingGlobalMute
    );
  }, [
    id,
    isInputMuted,
    isOutputMuted,
    value,
    joinProductionOptions,
    line,
    production,
    isSettingGlobalMute,
    registerCallList,
    isProgramOutputLine,
    isProgramUser,
  ]);

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

  const {
    startTalking,
    stopTalking,
    isTalking,
    handleLongPressStart,
    handleLongPressEnd,
  } = usePushToTalk({ muteInput });

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

  useHotkeys(savedHotkeys?.increaseVolumeHotkey || "u", () => {
    const newValue = Math.min(value + 0.05, 1);
    setValue(newValue);
  });

  useHotkeys(savedHotkeys?.decreaseVolumeHotkey || "d", () => {
    const newValue = Math.max(value - 0.05, 0);
    setValue(newValue);
  });

  // Update call device when the user changes the audio settings on Chrome or Edge
  useUpdateCallDevice({
    id,
    joinProductionOptions,
    audiooutput,
    audioElements,
    resetAudioInput,
    setConnectionActive,
    muteInput,
  });

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
    deregisterCall?.(id);

    if (isSingleCall) {
      navigate("/");
    }
  }, [dispatch, id, playExitSound, isSingleCall, navigate, deregisterCall]);

  useLineHotkeys({
    muteInput,
    isInputMuted,
    customKeyMute: savedHotkeys?.muteHotkey || "m",
    customKeyPress: savedHotkeys?.pushToTalkHotkey || "t",
    startTalking,
    stopTalking,
  });

  useEffect(() => {
    if (joinProductionOptions) {
      setConnectionActive(true);
    }
  }, [joinProductionOptions]);

  useMasterInputMute({
    inputAudioStream,
    isProgramOutputLine:
      joinProductionOptions?.lineUsedForProgramOutput ||
      line?.programOutputLine,
    masterInputMute,
    dispatch,
    id,
    muteInput,
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

  const setActionHandler = useCallback(
    (action: string, handler: () => void) => {
      const handlers = callActionHandlers.current;

      if (!handlers[id]) {
        handlers[id] = {};
      }
      handlers[id][action] = handler;
    },
    [callActionHandlers, id]
  );

  useCallActionHandlers({
    value,
    setValue,
    isInputMuted,
    isProgramOutputLine,
    isProgramUser,
    audioElements,
    muteInput,
    muteOutput,
    startTalking,
    stopTalking,
    setActionHandler,
  });

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
      logger.red("Data channel is not open.");
    }
  };

  // TODO detect if browser back button is pressed and run exit();

  return (
    <CallWrapper
      isSomeoneSpeaking={
        !isProgramOutputLine && !isSelfDominantSpeaker && isActiveParticipant
      }
    >
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
          audiooutput={audiooutput || undefined}
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
              onStartTalking={handleLongPressStart}
              onStopTalking={handleLongPressEnd}
              isTalking={isTalking}
              line={line}
              joinProductionOptions={joinProductionOptions}
              isOutputMuted={isOutputMuted}
              isInputMuted={isInputMuted}
              inputAudioStream={inputAudioStream}
              value={value}
            />
          )}
          <ExpandableSection className={open ? "expanded" : ""}>
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
                            <LongPressToTalkButton
                              onStartTalking={handleLongPressStart}
                              onStopTalking={handleLongPressEnd}
                              isTalking={isTalking}
                            />
                          </LongPressWrapper>
                        )}
                      {isBrowserFirefox && (
                        <CollapsableSection title="Devices">
                          <SelectDevices
                            line={line}
                            joinProductionOptions={joinProductionOptions}
                            audiooutput={audiooutput || undefined}
                            id={id}
                            audioElements={audioElements || []}
                            resetAudioInput={resetAudioInput}
                            muteInput={() => muteInput(true)}
                            setConnectionActive={() =>
                              setConnectionActive(false)
                            }
                          />
                        </CollapsableSection>
                      )}
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
                            <ConfirmationModal
                              title="Confirm"
                              description={`Are you sure you want to leave ${line?.name}?`}
                              onCancel={() => setConfirmExitModalOpen(false)}
                              onConfirm={exit}
                            />
                          )}
                        </ButtonWrapper>
                      )}
                    </div>
                  </ListWrapper>
                  <ListWrapper>
                    {confirmModalOpen && (
                      <ConfirmationModal
                        title="Confirm"
                        description={
                          muteError
                            ? "Something went wrong, Please try again"
                            : `Are you sure you want to mute ${userName}?`
                        }
                        confirmationText={
                          muteError
                            ? ""
                            : `This will mute ${userName} for everyone in the call.`
                        }
                        onConfirm={muteParticipant}
                        onCancel={() => setConfirmModalOpen(false)}
                      />
                    )}
                  </ListWrapper>
                </FlexContainer>
              )}
              {production && line && (
                <UrlButtonsWrapper>
                  <GenerateWhipUrlButton
                    productionId={production.productionId}
                    lineId={line.id}
                  />
                  <ShareLineButton
                    productionId={production.productionId}
                    lineId={line.id}
                  />
                </UrlButtonsWrapper>
              )}
            </InnerDiv>
          </ExpandableSection>
        </CallContainer>
      )}
    </CallWrapper>
  );
};
