import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const UserControlBtn = styled.button`
  background-color: transparent;
  border-color: transparent;
`;

export const ProductionLine: FC = () => {
  //  const { productionId, lineId } = useParams();
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

  const { connectionState, audioElements } = useRtcConnection({
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

  // TODO temporary, this view should handle direct links
  useEffect(() => {
    if (!joinProductionOptions) {
      navigate("/");
    }
  }, [navigate, joinProductionOptions]);

  useEffect(() => {
    if (connectionState === "connected") {
      setLoading(false);
    }
    // TODO add handling for `connectionState === "failed"`
  }, [connectionState]);

  // TODO if (!input !output !username) return <JoinProductionForm />

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

  // Mute/Unmute speaker
  // Show active sink and mic

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

      {loading && <Spinner className="join-production" />}

      {!loading && (
        <FlexContainer>
          <DisplayContainer>
            <div>
              <DisplayContainerHeader>Controls</DisplayContainerHeader>

              {audioElements.length && (
                <TempDiv>
                  Incoming Audio Channels: {audioElements.length}
                </TempDiv>
              )}
              {connectionState && (
                <TempDiv>RTC Connection State: {connectionState}</TempDiv>
              )}

              <TempDiv>
                <UserControlBtn
                  type="button"
                  onClick={() => setMicMute(!micMute)}
                >
                  {micMute ? <MicMuted /> : <MicUnmuted />}
                </UserControlBtn>
              </TempDiv>
            </div>
          </DisplayContainer>
          <DisplayContainer>
            {line && <UserList participants={line.participants} />}
          </DisplayContainer>
        </FlexContainer>
      )}
    </>
  );
};

// TODO hook that handles setting up a production to join when given a direct link
//  useEffect(() => {
//    if (joinProductionOptions) return noop;
//    // Should not be a real scenario, but keeps typescript happy
//    if (!productionId || !lineId) return noop;
//
//    const productionIdAsNumber = parseInt(productionId, 10);
//    const lineIdAsNumber = parseInt(lineId, 10);
//
//    if (Number.isNaN(productionIdAsNumber) || Number.isNaN(lineIdAsNumber)) {
//      // Someone entered a production id in the URL that's not a number
//      // TODO dispatch error
//      return noop;
//    }
//  }, [productionId, lineId, joinProductionOptions]);
