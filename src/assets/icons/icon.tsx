import styled from "@emotion/styled";
import MicMute from "./mic_off.svg";
import MicUnmute from "./mic_on.svg";
import RemoveIcon from "./clear.svg";

const Icon = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const RemoveLineStyling = styled.img`
  width: 2.5rem;
`;

export const MicMuted = () => <Icon src={MicMute} alt="off-microphone" />;

export const MicUnmuted = () => <Icon src={MicUnmute} alt="on-microphone" />;

export const RemoveLine = () => (
  <RemoveLineStyling src={RemoveIcon} alt="cross" />
);
