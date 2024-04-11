import styled from "@emotion/styled";
import MicMute from "./mic_off.svg";
import MicUnmute from "./mic_on.svg";

const Icon = styled.img`
  width: 8rem;
  padding-right: 1em;
`;

export const MicMuted = () => <Icon src={MicMute} alt="off-microphone" />;

export const MicUnmuted = () => <Icon src={MicUnmute} alt="on-microphone" />;
