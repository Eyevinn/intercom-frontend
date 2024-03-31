import {
  FilteredMediaEvent,
  getMediaEventFilter,
} from "@eyevinn/media-event-filter";
import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useAudioInput } from "./use-audio-input.ts";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { useGetRtcOffer } from "./use-get-rtc-offer.ts";
import { SubmitButton } from "../landing-page/form-elements.tsx";

const TempDiv = styled.div`
  padding: 1rem;
`;
export const Production: FC = () => {
  //  const { productionId, lineId } = useParams();
  const [{ joinProductionOptions }, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const [audioElement] = useState(new Audio());
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [playbackState, setPlaybackState] = useState<FilteredMediaEvent | null>(
    null
  );

  // Set up audio element
  useEffect(() => {
    audioElement.controls = true;
    audioElement.autoplay = true;
    audioElement.onerror = console.error;

    const { teardown } = getMediaEventFilter({
      // @ts-expect-error audio works
      videoElement: audioElement,
      callback: (ev) => {
        if (ev === FilteredMediaEvent.TIME_UPDATE) return;

        setPlaybackState(ev);
      },
    });

    return teardown;
  }, [audioElement]);

  // Attach audio element to DOM
  useEffect(() => {
    if (!audioContainerRef) return;

    if (audioContainerRef.current) {
      audioContainerRef.current.appendChild(audioElement);
    }
  }, [audioContainerRef, audioElement]);

  const inputAudioStream = useAudioInput({
    inputId: joinProductionOptions?.audioinput ?? null,
  });

  const { sessionId, sdpOffer } = useGetRtcOffer({
    joinProductionOptions,
  });

  const { connectionState } = useRtcConnection({
    inputAudioStream,
    sdpOffer,
    joinProductionOptions,
    sessionId,
    audioElement,
  });

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
        <SubmitButton onClick={exit}>Exit</SubmitButton>
      </TempDiv>
      <TempDiv>Production View</TempDiv>
      <TempDiv ref={audioContainerRef} />
      {playbackState && (
        <TempDiv>Audio Playback State: {playbackState}</TempDiv>
      )}
      {connectionState && (
        <TempDiv>RTC Connection State: {connectionState}</TempDiv>
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
