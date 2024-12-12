import styled from "@emotion/styled";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { useEstablishSession } from "./use-establish-session.ts";
import {
  PrimaryButton,
  SecondaryButton,
} from "../landing-page/form-elements.tsx";
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
import { useHeartbeat } from "./use-heartbeat.ts";
import { JoinProduction } from "../landing-page/join-production.tsx";
import { useDeviceLabels } from "./use-device-labels.ts";
import { isMobile } from "../../bowser.ts";
import { useLineHotkeys, useSpeakerHotkeys } from "./use-line-hotkeys.ts";
import { LongPressToTalkButton } from "./long-press-to-talk-button.tsx";
import { useLinePolling } from "./use-line-polling.ts";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { useIsLoading } from "./use-is-loading.ts";
import { useCheckBadLineData } from "./use-check-bad-line-data.ts";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button.tsx";
import { useAudioCue } from "./use-audio-cue.ts";
import { DisplayWarning } from "../display-box.tsx";
import { SettingsModal, Hotkeys } from "./settings-modal.tsx";
import VolumeSlider from "./volume-slider.tsx";

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

  :first-of-type {
    padding-left: 0;
  }

  :last-of-type {
    padding-right: 0;
  }
`;

const UserControlBtn = styled(SecondaryButton)`
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

export const ProductionLine: FC = () => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [
    { joinProductionOptions, dominantSpeaker, audioLevelAboveThreshold },
    dispatch,
  ] = useGlobalState();
  const [isInputMuted, setIsInputMuted] = useState(true);
  const [isOutputMuted, setIsOutputMuted] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [hotkeys, setHotkeys] = useState<Hotkeys>({
    muteHotkey: "m",
    speakerHotkey: "n",
    pressToTalkHotkey: "t",
  });
  const [savedHotkeys, setSavedHotkeys] = useState<Hotkeys>({
    muteHotkey: "m",
    speakerHotkey: "n",
    pressToTalkHotkey: "t",
  });

  const [volume, setVolume] = useState(0.5);
  // const [frequency, setFrequency] = useState(440);
  // const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  // const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const audioContext = new AudioContext();
        const response = await fetch(
          "https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3"
        );
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        audioBufferRef.current = audioBuffer;
        audioContextRef.current = audioContext;

        // Create a gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.connect(audioContext.destination);

        gainNodeRef.current = gainNode;
      } catch (error) {
        console.error("Error fetching audio file:", error);
      }
    };

    fetchAudio();
  }, [volume]);

  const startAudio = () => {
    if (audioContextRef.current && audioBufferRef.current) {
      const audioSource = audioContextRef.current.createBufferSource();
      audioSource.buffer = audioBufferRef.current;

      // Connect the source to the gain node
      audioSource.connect(gainNodeRef.current!);

      audioSource.start();
      audioSourceRef.current = audioSource;
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newVolume,
        audioContextRef.current!.currentTime
      );
    }
  };
  // const handleFrequencyChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const newFrequency = parseFloat(event.target.value);
  //   setFrequency(newFrequency);

  //   if (oscillatorRef.current) {
  //     oscillatorRef.current.frequency.setValueAtTime(
  //       newFrequency,
  //       audioContextRef.current!.currentTime
  //     );
  //   }
  // };

  // const handleWaveformChange = (
  //   event: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //   const newWaveform = event.target.value as OscillatorType;
  //   setWaveform(newWaveform);

  //   if (oscillatorRef.current) {
  //     oscillatorRef.current.type = newWaveform;
  //   }
  // };

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
    playExitSound();
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
  }, [dispatch, playExitSound]);

  useLineHotkeys({
    muteInput,
    isInputMuted,
    customKeyMute: savedHotkeys.muteHotkey,
    customKeyPress: savedHotkeys.pressToTalkHotkey,
  });

  const { sessionId, sdpOffer } = useEstablishSession({
    joinProductionOptions,
    dispatch,
  });

  const { connectionState, audioElements } = useRtcConnection({
    inputAudioStream,
    sdpOffer,
    joinProductionOptions,
    sessionId,
  });

  useEffect(() => {
    if (connectionState === "connected") {
      playEnterSound();
    }
  }, [connectionState, playEnterSound]);

  const muteOutput = useCallback(() => {
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

  const line = useLinePolling({ joinProductionOptions });

  const { production, error: fetchProductionError } = useFetchProduction(
    joinProductionOptions
      ? parseInt(joinProductionOptions.productionId, 10)
      : null
  );

  useEffect(() => {
    if (!fetchProductionError) return;

    dispatch({
      type: "ERROR",
      payload:
        fetchProductionError instanceof Error
          ? fetchProductionError
          : new Error("Error fetching production."),
    });
  }, [dispatch, fetchProductionError]);

  const { loading, connectionError } = useIsLoading({ connectionState });

  useHeartbeat({ sessionId });

  const deviceLabels = useDeviceLabels({ joinProductionOptions });

  useCheckBadLineData({
    joinProductionOptions,
    paramLineId,
    paramProductionId,
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
        <ButtonWrapper>
          <NavigateToRootButton resetOnExit={exit} />
        </ButtonWrapper>
        {!loading && production && line && (
          <DisplayContainerHeader>
            <SmallText>Production:</SmallText> {production.name}{" "}
            <SmallText>Line:</SmallText> {line.name}
          </DisplayContainerHeader>
        )}
      </HeaderWrapper>

      {!joinProductionOptions && paramProductionId && paramLineId && (
        <FlexContainer>
          <DisplayContainer>
            <JoinProduction
              preSelected={{
                preSelectedProductionId: paramProductionId,
                preSelectedLineId: paramLineId,
              }}
            />
          </DisplayContainer>
        </FlexContainer>
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

              <VolumeSlider
                label="Volume"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
              />
              {isPlaying ? (
                <PrimaryButton onClick={stopAudio}>Stop Audio</PrimaryButton>
              ) : (
                <PrimaryButton onClick={startAudio}>Play Audio</PrimaryButton>
              )}

              <FlexContainer>
                <FlexButtonWrapper>
                  <UserControlBtn type="button" onClick={() => muteOutput()}>
                    <ButtonIcon>
                      {isOutputMuted ? <SpeakerOff /> : <SpeakerOn />}
                    </ButtonIcon>
                  </UserControlBtn>
                </FlexButtonWrapper>

                {inputAudioStream && inputAudioStream !== "no-device" && (
                  <FlexButtonWrapper>
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
