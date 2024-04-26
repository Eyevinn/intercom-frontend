import styled from "@emotion/styled";
import { FC, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { useEstablishSession } from "./use-establish-session.ts";
import { SecondaryButton } from "../landing-page/form-elements.tsx";
import { UserList } from "./user-list.tsx";
import {
  MicMuted,
  MicUnmuted,
  SpeakerOff,
  SpeakerOn,
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

const TempDiv = styled.div`
  padding: 0 0 2rem 0;
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
    console.log(state);
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

export const ProductionLine: FC = () => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [
    { joinProductionOptions, dominantSpeaker, audioLevelAboveThreshold },
    dispatch,
  ] = useGlobalState();
  const [isInputMuted, setIsInputMuted] = useState(true);
  const [isOutputMuted, setIsOutputMuted] = useState(false);

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

  const exit = useCallback(() => {
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
  }, [dispatch]);

  useLineHotkeys({
    muteInput,
    isInputMuted,
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

  const loading = useIsLoading({ connectionState });

  useHeartbeat({ sessionId });

  const deviceLabels = useDeviceLabels({ joinProductionOptions });

  useCheckBadLineData({
    joinProductionOptions,
    paramLineId,
    paramProductionId,
    dispatch,
  });

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

      {joinProductionOptions && loading && (
        <Spinner className="join-production" />
      )}

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
                    <TempDiv>
                      <strong>Hotkeys</strong>
                    </TempDiv>
                    <TempDiv>
                      <strong>M:</strong> Toggle Input Mute
                    </TempDiv>
                    <TempDiv>
                      <strong>N:</strong> Toggle Output Mute
                    </TempDiv>
                    <TempDiv>
                      <strong>T:</strong> Push to Talk
                    </TempDiv>
                  </>
                )}
            </div>
          </ListWrapper>
          <ListWrapper>
            {line && (
              <UserList
                sessionid={sessionId}
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
