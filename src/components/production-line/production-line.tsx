import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { useEstablishSession } from "./use-establish-session.ts";
import { ActionButton } from "../landing-page/form-elements.tsx";
import { useAudioElement } from "./use-audio-element.ts";
import { UserList } from "./user-list.tsx";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";

const TempDiv = styled.div`
  padding: 1rem;
`;
export const ProductionLine: FC = () => {
  //  const { productionId, lineId } = useParams();
  const [{ joinProductionOptions }, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [participants, setParticipants] = useState<
    { name: string; sessionid: string }[] | null
  >(null);

  const { playbackState, audioElement } = useAudioElement({
    audioContainerRef,
  });

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
    audioElement,
  });

  // Participant list, TODO extract hook to separate file
  useEffect(() => {
    if (!joinProductionOptions) return noop;

    let interval: number | null = null;

    const productionId = parseInt(joinProductionOptions.productionId, 10);
    const lineId = parseInt(joinProductionOptions.lineId, 10);

    API.fetchProductionLine(productionId, lineId)
      .then((line) => setParticipants(line.participants))
      .catch(console.error);

    interval = window.setInterval(() => {
      API.fetchProductionLine(productionId, lineId)
        .then((line) => setParticipants(line.participants))
        .catch(console.error);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [joinProductionOptions]);

  // TODO temporary, this view should handle direct links
  useEffect(() => {
    if (!joinProductionOptions) {
      navigate("/");
    }
  }, [navigate, joinProductionOptions]);

  // TODO pretty spinner component

  // TODO if (!input !output !username) return <JoinProductionForm />

  const exit = () => {
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
    navigate("/");
  };

  // Mute/Unmute mic
  // Mute/Unmute speaker
  // Show active sink and mic
  // Exit button (link to /, clear production from state)
  return (
    <div>
      <TempDiv>
        <ActionButton onClick={exit}>Exit</ActionButton>
      </TempDiv>
      <TempDiv>Production View</TempDiv>
      <TempDiv ref={audioContainerRef} />
      {playbackState && (
        <TempDiv>Audio Playback State: {playbackState}</TempDiv>
      )}
      {connectionState && (
        <TempDiv>RTC Connection State: {connectionState}</TempDiv>
      )}

      <UserList participants={participants} />
    </div>
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
