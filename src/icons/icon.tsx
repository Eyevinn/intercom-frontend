import styled from "@emotion/styled";
import MicMute from "./microphone-off-red.png";
import MicUnmute from "./microphone-green.png";

const Icon = styled.img`
  width: 5rem;
  padding-right: 1em;
  pointer-events: none;
`;

export const MicMuted = () => <Icon src={MicMute} alt="red-microphone" />;

export const MicUnmuted = () => <Icon src={MicUnmute} alt="green-microphone" />;
