import MicMute from "./mic_off.svg?react";
import MicUnmute from "./mic_on.svg?react";
import Arrow from "./arrow_back.svg?react";
import RemoveSvg from "./clear.svg?react";
import VolumeOn from "./volume_on.svg?react";
import VolumeOff from "./volume_off.svg?react";
import UserSvg from "./user.svg?react";
import ConfirmSvg from "./done.svg?react";

export const MicMuted = () => <MicMute />;

export const MicUnmuted = () => <MicUnmute />;

export const BackArrow = () => <Arrow />;

export const RemoveIcon = () => <RemoveSvg />;

export const SpeakerOff = () => <VolumeOff />;

export const SpeakerOn = () => <VolumeOn />;

export const UserIcon = () => <UserSvg />;

export const ConfirmIcon = () => <ConfirmSvg />;
