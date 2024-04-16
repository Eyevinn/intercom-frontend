import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { useEstablishSession } from "./use-establish-session.ts";
import { ActionButton } from "../landing-page/form-elements.tsx";
import { UserList } from "./user-list.tsx";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import { MicMuted, MicUnmuted } from "../../assets/icons/icon.tsx";
import { Spinner } from "../loader/loader.tsx";
import { TLine, TProduction } from "./types.ts";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { DisplayContainer, FlexContainer } from "../generic-components.ts";
import { useHeartbeat } from "./use-heartbeat.ts";
import { JoinProduction } from "../landing-page/join-production.tsx";
import { useDeviceLabels } from "./use-device-labels.ts";

const TempDiv = styled.div`
  padding: 1rem 0;
`;

const HeaderWrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
`;

const SmallText = styled.span`
  font-size: 1.6rem;
`;

const ButtonWrapper = styled.span`
  margin: 0 2rem 0 0;
`;

const ButtonIcon = styled.div`
  width: 2.5rem;
  display: inline-block;
  vertical-align: middle;
  margin: 0 0.5rem 0 0;
`;

const UserControlBtn = styled(ActionButton)`
  line-height: 2;
  min-width: 12rem;
  text-align: left;
`;

export const ProductionLine: FC = () => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [{ joinProductionOptions, mediaStreamInput }, dispatch] =
    useGlobalState();
  const navigate = useNavigate();
  const [micMute, setMicMute] = useState(true);
  const [line, setLine] = useState<TLine | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [production, setProduction] = useState<TProduction | null>(null);

  const inputAudioStream = useAudioInput({
    inputId: joinProductionOptions?.audioinput ?? null,
  });

  const { sessionId, sdpOffer } = useEstablishSession({
    joinProductionOptions,
  });

  const { connectionState } = useRtcConnection({
    inputAudioStream,
    sdpOffer,
    joinProductionOptions,
    sessionId,
  });

  // Participant list, TODO extract hook to separate file
  useEffect(() => {
    if (!joinProductionOptions) return noop;

    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    const interval = window.setInterval(() => {
      API.fetchProductionLine(productionId, lineId)
        .then((l) => setLine(l))
        .catch(console.error);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [joinProductionOptions]);

  useEffect(() => {
    if (!joinProductionOptions) return;

    const productionId = parseInt(joinProductionOptions.productionId, 10);

    API.fetchProduction(productionId).then((p) => {
      setProduction(p);
    });
  }, [joinProductionOptions]);

  useEffect(() => {
    if (connectionState === "connected") {
      setLoading(false);
    }
    // TODO add handling for `connectionState === "failed"`
  }, [connectionState]);

  useHeartbeat({ sessionId });

  const exit = () => {
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
    navigate("/");
  };

  useEffect(() => {
    if (mediaStreamInput) {
      mediaStreamInput.getTracks().forEach((track) => {
        // eslint-disable-next-line no-param-reassign
        track.enabled = !micMute;
      });
    }
  }, [mediaStreamInput, micMute]);

  const deviceLabels = useDeviceLabels({ joinProductionOptions });

  // Check if we have what's needed to join a production line
  if (!joinProductionOptions) {
    const pidIsNan = Number.isNaN(
      paramProductionId && parseInt(paramProductionId, 10)
    );

    const lidIsNan = Number.isNaN(paramLineId && parseInt(paramLineId, 10));

    if (pidIsNan || lidIsNan) {
      // Someone entered a production id in the URL that's not a number

      const errorString = `Bad URL. ${pidIsNan ? "Production ID is not a number." : ""} ${lidIsNan ? "Line ID is not a number." : ""}`;

      dispatch({
        type: "ERROR",
        payload: new Error(errorString),
      });
    }
  }

  // TODO detect if browser back button is pressed and run exit();
  return (
    <>
      <HeaderWrapper>
        <ButtonWrapper>
          <ActionButton onClick={exit}>Exit</ActionButton>
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
            <TempDiv>Status: {connectionState}</TempDiv>
          </DisplayContainer>
        </FlexContainer>
      )}

      {joinProductionOptions && loading && (
        <Spinner className="join-production" />
      )}

      {joinProductionOptions && !loading && (
        <FlexContainer>
          <DisplayContainer>
            <div>
              <DisplayContainerHeader>Controls</DisplayContainerHeader>

              <TempDiv>
                <UserControlBtn
                  type="button"
                  onClick={() => setMicMute(!micMute)}
                >
                  <ButtonIcon>
                    {micMute ? <MicMuted /> : <MicUnmuted />}
                  </ButtonIcon>
                  {micMute ? "Muted" : "Unmuted"}
                </UserControlBtn>
              </TempDiv>

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
            </div>
          </DisplayContainer>
          <DisplayContainer>
            {line && (
              <UserList
                sessionid={sessionId}
                participants={line.participants}
              />
            )}
          </DisplayContainer>
        </FlexContainer>
      )}
    </>
  );
};
