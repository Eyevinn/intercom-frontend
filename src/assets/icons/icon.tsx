import MicMute from "./mic_off.svg";
import MicUnmute from "./mic_on.svg";

export const MicMuted = () => <img src={MicMute} alt="off-microphone" />;

export const MicUnmuted = () => <img src={MicUnmute} alt="on-microphone" />;
