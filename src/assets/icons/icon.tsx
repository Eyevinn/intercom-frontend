import styled from "@emotion/styled";
import MicMute from "./mic_off.svg";
import MicUnmute from "./mic_on.svg";
import RemoveSvg from "./clear.svg";
import VolumeOn from "./volume_on.svg";
import VolumeOff from "./volume_off.svg";

const Icon = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

export const MicMuted = () => <Icon src={MicMute} alt="off-microphone" />;

export const MicUnmuted = () => <Icon src={MicUnmute} alt="on-microphone" />;

export const RemoveIcon = () => <Icon src={RemoveSvg} alt="cross" />;

export const SpeakerOff = () => (
  <Icon src={VolumeOff} alt="speaker-crossed-over" />
);

export const SpeakerOn = () => <Icon src={VolumeOn} alt="speaker" />;
