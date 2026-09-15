import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams } from "react-router";
import { API } from "../../api/api.ts";
import { isBrowserFirefox, isMobile, isTablet } from "../../bowser.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { CallState } from "../../global-state/types.ts";
import { useCallActionHandlers } from "../../hooks/use-call-action-handlers.ts";
import { CallData } from "../../hooks/use-call-list.ts";
import { usePushToTalk } from "../../hooks/use-push-to-talk.ts";
import logger from "../../utils/logger.ts";
import { DisplayWarning } from "../display-box.tsx";
import { FlexContainer } from "../generic-components.ts";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { Spinner } from "../loader/loader.tsx";
import { ExpandableSection, InnerDiv } from "../shared/shared-components.ts";
import { ConfirmationModal } from "../verify-decision/confirmation-modal.tsx";
import { CallHeaderComponent } from "./call-header.tsx";
import { CollapsableSection } from "./collapsable-section.tsx";
import { ExitCallButton } from "./exit-call-button.tsx";
import { SettingsModal } from "./settings-modal.tsx";
import { LongPressToTalkButton } from "./long-press-to-talk-button.tsx";
import { MinifiedUserControls } from "./minified-user-controls.tsx";
import {
  ButtonWrapper,
  CallContainer,
  CallWrapper,
  ConnectionErrorWrapper,
  ListInnerWrapper,
  ListWrapper,
  LoaderWrapper,
  LongPressWrapper,
  PinDialogBackdrop,
  PinDialogPopover,
  VideoGrid,
  VideoSection,
} from "./production-line-components.ts";
import { SelectDevices } from "./select-devices.tsx";
import { SymphonyRtcConnectionComponent } from "./symphony-rtc-connection-component.tsx";
import { useActiveParticipant } from "./use-active-participant.tsx";
import { useAudioCue } from "./use-audio-cue.ts";
import { useAudioInput } from "./use-audio-input.ts";
import { useVideoInput } from "./use-video-input.ts";
import { TJoinProductionOptions } from "./types.ts";
import { useShadowRtcConnection } from "./use-shadow-rtc-connection.ts";
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
import { computeVideoTileLabels } from "./match-video-tile-labels.ts";
import { useVideoTileGrid } from "./use-video-tile-grid.ts";
import { useVideoSourcePin } from "./use-video-source-pin.ts";
import { sendPinnedEndpoint } from "./pin-data-channel.ts";
import { SelfPreviewTile } from "./self-preview-tile.tsx";
import { ReturnFeedTile } from "./return-feed-tile.tsx";
import { RemoteFullscreenControls } from "./remote-fullscreen-controls.tsx";
import { VideoOptionsDialogue } from "./video-options-modal.tsx";

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
  order?: number;
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
  order,
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
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [pinnedSessionId, setPinnedSessionId] = useState<string | null>(null);
  const desiredPinEndpointIdRef = useRef<string | null>(null);
  const [pinnedContainer, setPinnedContainer] = useState<HTMLElement | null>(
    null
  );
  const [userOptionsTarget, setUserOptionsTarget] = useState<{
    sessionId: string;
    rect: DOMRect;
  } | null>(null);
  const [userName, setUserName] = useState("");
  const [pendingWhepTargetSessionId, setPendingWhepTargetSessionId] = useState<
    string | null
  >(null);
  const [open, setOpen] = useState<boolean>(!isMobile);
  const [hotkeysModalOpen, setHotkeysModalOpen] = useState(false);
  const {
    joinProductionOptions,
    audiooutput,
    dominantSpeaker,
    audioLevelAboveThreshold,
    connectionState,
    audioElements,
    videoElements,
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

  const videoEnabled = joinProductionOptions?.videoEnabled ?? false;
  const [inputVideoStream] = useVideoInput({
    videoInputId: videoEnabled
      ? (joinProductionOptions?.videoinput ?? "no-device")
      : null,
    dispatch,
  });

  useEffect(() => {
    if (!inputVideoStream || inputVideoStream === "no-device") return;
    inputVideoStream.getVideoTracks().forEach((track) => {
      // eslint-disable-next-line no-param-reassign
      track.enabled = !isVideoMuted;
    });
  }, [inputVideoStream, isVideoMuted]);

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

  const tileMatches = useMemo(
    () =>
      computeVideoTileLabels(
        (videoElements ?? []).map((el) => ({
          endpointId: el.dataset.endpointId || "",
          previousSessionId: el.dataset.lastSessionId || null,
        })),
        line?.participants ?? [],
        callState.sessionId ?? null
      ),
    [videoElements, line?.participants, callState.sessionId]
  );

  const pinnedVideoSessionId = pinnedSessionId;

  const { pushWhepSourceToBackend, pushVideoSourceToBackend } =
    useVideoSourcePin({
      joinProductionOptions: joinProductionOptions ?? null,
      callSessionId: callState.sessionId ?? null,
    });

  useEffect(() => {
    const selfSid = callState.sessionId;
    if (!selfSid) return;

    const eligible = (line?.participants ?? []).filter(
      (p) =>
        p.sessionId !== selfSid && p.isActive && p.hasVideo && !p.isWhepReceiver
    );
    const pinnedStillEligible =
      pinnedSessionId !== null &&
      eligible.some((p) => p.sessionId === pinnedSessionId);
    if (pinnedStillEligible) return;
    const next = eligible[0]?.sessionId ?? null;
    if (next === pinnedSessionId) return;
    setPinnedSessionId(next);
    pushVideoSourceToBackend(next);

    const nextEndpointId =
      eligible.find((p) => p.sessionId === next)?.endpointId ?? null;
    desiredPinEndpointIdRef.current = nextEndpointId;
    sendPinnedEndpoint(dataChannel, nextEndpointId);
  }, [
    line?.participants,
    callState.sessionId,
    pinnedSessionId,
    pushVideoSourceToBackend,
    dataChannel,
  ]);

  useEffect(() => {
    if (!dataChannel) return undefined;
    const flush = () =>
      sendPinnedEndpoint(dataChannel, desiredPinEndpointIdRef.current);
    if (dataChannel.readyState === "open") {
      flush();
      return undefined;
    }
    dataChannel.addEventListener("open", flush);
    return () => dataChannel.removeEventListener("open", flush);
  }, [dataChannel]);

  const isWhipOnLine = line?.participants.some((p) => p.isWhip);
  const isSomeoneSpeaking =
    !isProgramOutputLine &&
    !isSelfDominantSpeaker &&
    isActiveParticipant &&
    !isWhipOnLine;

  const { production, error: fetchProductionError } = useFetchProduction(
    joinProductionOptions
      ? parseInt(joinProductionOptions.productionId, 10)
      : null
  );

  const siblingProgramLine = useMemo(
    () =>
      production?.lines.find(
        (l: {
          programOutputLine?: boolean;
          id: string;
          name: string;
          videoEnabled?: boolean;
        }) => l.programOutputLine && l.id !== joinProductionOptions?.lineId
      ) ?? null,
    [production, joinProductionOptions?.lineId]
  );

  const shadowJoinOptions: TJoinProductionOptions | null = useMemo(() => {
    if (!videoEnabled || !siblingProgramLine || !joinProductionOptions)
      return null;
    return {
      ...joinProductionOptions,
      lineId: siblingProgramLine.id,
      lineName: siblingProgramLine.name,
      videoinput: undefined,
      videoEnabled: !!siblingProgramLine.videoEnabled,
      isProgramUser: true,
      lineUsedForProgramOutput: true,
    };
  }, [videoEnabled, siblingProgramLine, joinProductionOptions]);

  const {
    audioElements: shadowAudioElements,
    videoElements: shadowVideoElements,
  } = useShadowRtcConnection(shadowJoinOptions);

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
        isSomeoneSpeaking: isSomeoneSpeaking || false,
        presetOrder: order,
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
    isSomeoneSpeaking,
    order,
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

  useEffect(() => {
    shadowAudioElements.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.volume = value;
    });
  }, [shadowAudioElements, value]);

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

  const toggleVideo = useCallback(() => {
    if (!inputVideoStream || inputVideoStream === "no-device") return;
    const nextMuted = !isVideoMuted;
    inputVideoStream.getVideoTracks().forEach((track) => {
      // eslint-disable-next-line no-param-reassign
      track.enabled = !nextMuted;
    });
    setIsVideoMuted(nextMuted);
  }, [inputVideoStream, isVideoMuted]);

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

  const handleAutoUnpin = useCallback(() => setPinnedContainer(null), []);

  const pendingPinPromiseRef = useRef<Promise<void> | null>(null);

  const [videoGridNode, setVideoGridNode] = useState<HTMLDivElement | null>(
    null
  );

  const { setVideoGridEl } = useVideoTileGrid({
    videoElements: videoElements ?? null,
    participants: line?.participants ?? [],
    tileMatches,
    pinnedContainer,
    pinnedSessionId,
    cameraStream:
      inputVideoStream && inputVideoStream !== "no-device"
        ? inputVideoStream
        : null,
    cameraLabel: joinProductionOptions?.username ?? null,
    pendingPinPromiseRef,
    onAutoUnpin: handleAutoUnpin,
  });

  const [siblingLineParticipants, setSiblingLineParticipants] = useState<
    import("./types.ts").TParticipant[]
  >([]);
  useEffect(() => {
    if (!shadowJoinOptions) {
      setSiblingLineParticipants([]);
      return undefined;
    }
    const productionId = parseInt(shadowJoinOptions.productionId, 10);
    const lineId = parseInt(shadowJoinOptions.lineId, 10);
    const interval = window.setInterval(() => {
      API.fetchProductionLine(productionId, lineId)
        .then((l: import("./types.ts").TLine) =>
          setSiblingLineParticipants(l.participants)
        )
        .catch(() => {});
    }, 2000);
    return () => window.clearInterval(interval);
  }, [shadowJoinOptions]);

  const whipParticipantName = useMemo(
    () => siblingLineParticipants.find((p) => p.isWhip)?.name ?? null,
    [siblingLineParticipants]
  );

  const pgmStream = useMemo(() => {
    if (!videoEnabled || shadowVideoElements.length === 0) return null;
    const el = shadowVideoElements[0];
    return el.srcObject instanceof MediaStream ? el.srcObject : null;
  }, [videoEnabled, shadowVideoElements]);

  const pinnedRemoteStream = useMemo(() => {
    const elements = videoElements ?? [];
    if (elements.length === 0) return null;
    const matchByPin = pinnedSessionId
      ? elements.find((el) => el.dataset.lastSessionId === pinnedSessionId)
      : null;
    const candidate =
      matchByPin ?? (elements.length === 1 ? elements[0] : null);
    return candidate?.srcObject instanceof MediaStream
      ? candidate.srcObject
      : null;
  }, [videoElements, pinnedSessionId]);

  const pinnedRemoteName = useMemo(() => {
    if (pinnedSessionId) {
      return (
        line?.participants.find((p) => p.sessionId === pinnedSessionId)?.name ??
        null
      );
    }
    const elements = videoElements ?? [];
    const candidate = elements.length === 1 ? elements[0] : null;
    const sid = candidate?.dataset.lastSessionId ?? null;
    if (!sid) return null;
    return line?.participants.find((p) => p.sessionId === sid)?.name ?? null;
  }, [videoElements, pinnedSessionId, line?.participants]);

  const pinnedRemoteIsWhip = useMemo(() => {
    if (pinnedSessionId) {
      return (
        line?.participants.find((p) => p.sessionId === pinnedSessionId)
          ?.isWhip ?? null
      );
    }
    const elements = videoElements ?? [];
    const candidate = elements.length === 1 ? elements[0] : null;
    const sid = candidate?.dataset.lastSessionId ?? null;
    if (!sid) return null;
    return line?.participants.find((p) => p.sessionId === sid)?.isWhip ?? null;
  }, [videoElements, pinnedSessionId, line?.participants]);

  const handleSetWhep = (targetSessionId: string) => {
    setPendingWhepTargetSessionId(targetSessionId);
    setUserOptionsTarget(null);
  };

  const confirmSetWhep = () => {
    if (!pendingWhepTargetSessionId) return;
    const isAlreadyWhep =
      (line?.whepSourceSessionId ?? null) === pendingWhepTargetSessionId;
    const next = isAlreadyWhep ? null : pendingWhepTargetSessionId;
    pushWhepSourceToBackend(next);
    setPendingWhepTargetSessionId(null);
  };

  const whepConfirmTexts = useMemo(() => {
    if (!pendingWhepTargetSessionId) return null;
    const targetParticipant = line?.participants.find(
      (p) => p.sessionId === pendingWhepTargetSessionId
    );
    const targetName = targetParticipant?.name ?? "this participant";
    const currentSid = line?.whepSourceSessionId ?? null;
    const isToggleOff = currentSid === pendingWhepTargetSessionId;
    const note = (
      <>
        Note: if you already have a WHEP receiver running, you might need to
        restart it to see the updated source.
      </>
    );
    if (isToggleOff) {
      return {
        title: "Clear WHEP source?",
        description: (
          <>
            Are you sure you want to clear <em>{targetName}</em> as the WHEP
            source for everyone on this call?
          </>
        ),
        confirmationText: note,
      };
    }
    const currentParticipant = currentSid
      ? line?.participants.find((p) => p.sessionId === currentSid)
      : null;
    if (currentParticipant) {
      return {
        title: "Replace WHEP source?",
        description: (
          <>
            Are you sure you want to replace the current WHEP source{" "}
            <em>{currentParticipant.name}</em> with <em>{targetName}</em> for
            everyone on this call?
          </>
        ),
        confirmationText: note,
      };
    }
    return {
      title: "Set WHEP source?",
      description: (
        <>
          Are you sure you want to set <em>{targetName}</em> as the WHEP source
          for everyone on this call?
        </>
      ),
      confirmationText: note,
    };
  }, [
    pendingWhepTargetSessionId,
    line?.participants,
    line?.whepSourceSessionId,
  ]);

  const handlePin = (targetSessionId: string) => {
    const isAlreadyPinned = pinnedSessionId === targetSessionId;
    const next = isAlreadyPinned ? null : targetSessionId;
    setPinnedSessionId(next);
    let nextEndpointId: string | null = null;
    if (next === null) {
      setPinnedContainer(null);
    } else {
      const participant = line?.participants.find((p) => p.sessionId === next);
      const epid = participant?.endpointId;
      nextEndpointId = epid ?? null;
      const matchingEl = epid
        ? (videoElements ?? []).find((el) => el.dataset.endpointId === epid)
        : undefined;
      const container =
        (matchingEl?.parentElement as HTMLElement | null) ??
        (matchingEl as HTMLElement | null) ??
        null;
      setPinnedContainer(container);
    }
    desiredPinEndpointIdRef.current = nextEndpointId;
    sendPinnedEndpoint(dataChannel, nextEndpointId);
    pendingPinPromiseRef.current = pushVideoSourceToBackend(next);
    setUserOptionsTarget(null);
  };

  // TODO detect if browser back button is pressed and run exit();

  return (
    <CallWrapper
      isSomeoneSpeaking={
        !isProgramOutputLine &&
        !isSelfDominantSpeaker &&
        isActiveParticipant &&
        !isWhipOnLine
      }
      order={order}
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
          inputVideoStream={inputVideoStream}
          videoEnabled={videoEnabled}
          callId={id}
          dispatch={dispatch}
        />
      )}
      {!connectionError && !loading && (
        <CallContainer
          isProgramLine={line?.programOutputLine}
          isVideoEnabled={line?.videoEnabled}
        >
          {line && (
            <CallHeaderComponent
              open={open}
              line={line}
              production={production}
              setOpen={() => setOpen(!open)}
              showHotkeys={
                !!(
                  inputAudioStream &&
                  inputAudioStream !== "no-device" &&
                  !isMobile &&
                  !isTablet
                )
              }
              onOpenHotkeys={() => setHotkeysModalOpen(true)}
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
                    <ListInnerWrapper>
                      {videoEnabled && (
                        <VideoSection>
                          {/* Local camera self-preview with fullscreen */}
                          <SelfPreviewTile
                            stream={inputVideoStream}
                            username={joinProductionOptions?.username}
                            isInputMuted={isInputMuted}
                            muteInput={() => muteInput(!isInputMuted)}
                            inputAudioStream={inputAudioStream}
                            pgmStream={pgmStream}
                            pinnedRemoteStream={pinnedRemoteStream}
                            pinnedRemoteName={pinnedRemoteName}
                            isPinnedRemoteWhip={pinnedRemoteIsWhip}
                            isVideoMuted={isVideoMuted}
                            hasCamera={
                              !!inputVideoStream &&
                              inputVideoStream !== "no-device"
                            }
                            toggleVideo={toggleVideo}
                          />
                          {/* Return Feed — renders itself when shadow stream is active */}
                          <ReturnFeedTile
                            stream={pgmStream}
                            cameraStream={inputVideoStream}
                            label={whipParticipantName}
                            cameraLabel={
                              joinProductionOptions?.username ?? null
                            }
                          />
                          {/* Remote participant video tiles */}
                          <VideoGrid
                            ref={(node) => {
                              setVideoGridEl(node);
                              setVideoGridNode(node);
                            }}
                          />
                          <RemoteFullscreenControls
                            gridEl={videoGridNode}
                            hasMic={
                              !!inputAudioStream &&
                              inputAudioStream !== "no-device"
                            }
                            isInputMuted={isInputMuted}
                            onToggleMute={() => muteInput(!isInputMuted)}
                            hasCamera={
                              !!inputVideoStream &&
                              inputVideoStream !== "no-device"
                            }
                            isVideoMuted={isVideoMuted}
                            onToggleVideo={toggleVideo}
                          />
                        </VideoSection>
                      )}
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
                        videoEnabled={videoEnabled}
                        isVideoMuted={isVideoMuted}
                        toggleVideo={toggleVideo}
                        hasCamera={
                          !!inputVideoStream && inputVideoStream !== "no-device"
                        }
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
                      <CollapsableSection title="Participants" startOpen>
                        {line && (
                          <UserList
                            sessionId={sessionId}
                            participants={line.participants}
                            dominantSpeaker={dominantSpeaker}
                            audioLevelAboveThreshold={audioLevelAboveThreshold}
                            programOutputLine={line.programOutputLine}
                            videoEnabled={line.videoEnabled}
                            setConfirmModalOpen={setConfirmModalOpen}
                            setUserId={setUserId}
                            setUserName={setUserName}
                            pinnedVideoSessionId={pinnedVideoSessionId}
                            whepSourceSessionId={
                              line.whepSourceSessionId ?? null
                            }
                            onPin={handlePin}
                            onSetWhep={handleSetWhep}
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
                    </ListInnerWrapper>
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
                            : `This will mute ${userName} for everyone in the line.`
                        }
                        onConfirm={muteParticipant}
                        onCancel={() => setConfirmModalOpen(false)}
                      />
                    )}
                    {pendingWhepTargetSessionId && whepConfirmTexts && (
                      <ConfirmationModal
                        title={whepConfirmTexts.title}
                        description={whepConfirmTexts.description}
                        confirmationText={whepConfirmTexts.confirmationText}
                        onConfirm={confirmSetWhep}
                        onCancel={() => setPendingWhepTargetSessionId(null)}
                      />
                    )}
                  </ListWrapper>
                </FlexContainer>
              )}
            </InnerDiv>
          </ExpandableSection>
          {hotkeysModalOpen && savedHotkeys && joinProductionOptions && (
            <SettingsModal
              isOpen={hotkeysModalOpen}
              callId={id}
              savedHotkeys={savedHotkeys}
              customGlobalMute={customGlobalMute}
              lineName={line?.name}
              programOutPutLine={line?.programOutputLine}
              isProgramUser={joinProductionOptions.isProgramUser}
              onClose={() => setHotkeysModalOpen(false)}
              onSave={() => setHotkeysModalOpen(false)}
            />
          )}
          {userOptionsTarget && (
            <>
              <PinDialogBackdrop onClick={() => setUserOptionsTarget(null)} />
              <PinDialogPopover
                top={userOptionsTarget.rect.bottom + 4}
                left={userOptionsTarget.rect.left}
              >
                <VideoOptionsDialogue
                  isPinned={pinnedSessionId === userOptionsTarget.sessionId}
                  isWhepSource={
                    (line?.whepSourceSessionId ?? null) ===
                    userOptionsTarget.sessionId
                  }
                  onPin={() => {
                    handlePin(userOptionsTarget.sessionId);
                  }}
                  onSelectAsWhep={() =>
                    handleSetWhep(userOptionsTarget.sessionId)
                  }
                />
              </PinDialogPopover>
            </>
          )}
        </CallContainer>
      )}
    </CallWrapper>
  );
};
