import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { useEstablishSession } from "./use-establish-session.ts";
import { ActionButton } from "../landing-page/form-elements.tsx";
import { UserList } from "./user-list.tsx";
import { API } from "../../api/api.ts";
import { noop } from "../../helpers.ts";
import { MicMuted, MicUnmuted } from "../../icons/icon.tsx";
import { Spinner } from "../loader/loader.tsx";

const TempDiv = styled.div`
  padding: 1rem;
`;

const UserControlBtn = styled.button`
  background-color: transparent;
  border-color: transparent;
`;

export const ProductionLine: FC = () => {
  //  const { productionId, lineId } = useParams();
  const [{ joinProductionOptions, audioInput }, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [micMute, setMicMute] = useState(true);
  const [participants, setParticipants] = useState<
    { name: string; sessionid: string }[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);

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
    if (audioInput) {
      audioInput.enabled = !micMute;
    }
  }, [audioInput, micMute]);

  // Mute/Unmute speaker
  // Show active sink and mic
  // Exit button (link to /, clear production from state)

  return (
    <div>
      <TempDiv>
        <ActionButton onClick={exit}>Exit</ActionButton>
      </TempDiv>
      {loading && <Spinner className="join-production" />}
      {!loading && (
        <>
          <TempDiv>Production View</TempDiv>
          <TempDiv>
            <UserControlBtn type="button" onClick={() => setMicMute(!micMute)}>
              {micMute ? <MicMuted /> : <MicUnmuted />}
            </UserControlBtn>
          </TempDiv>
          <TempDiv ref={audioContainerRef} />
          {audioElements.length && (
            <TempDiv>Incoming Audio Channels: {audioElements.length}</TempDiv>
          )}
          {connectionState && (
            <TempDiv>RTC Connection State: {connectionState}</TempDiv>
          )}

          <UserList participants={participants} />
        </>
      )}
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
