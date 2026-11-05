import {
  Hotkeys,
  TJoinProductionOptions,
  TProduction,
} from "../components/ui/production-line/types.ts";
import { TUserSettings } from "../components/ui/user-settings/types.ts";
import { TRoleAuth } from "../api/role-auth-store.ts";

export interface ErrorState {
  globalError?: Error | null;
  globalWarning?: string | null;
  callErrors?: Record<string, Error> | null;
}

export interface DevicesState {
  input: MediaDeviceInfo[] | null;
  output: MediaDeviceInfo[] | null;
  videoInput: MediaDeviceInfo[] | null;
}

export interface CallState {
  joinProductionOptions: TJoinProductionOptions | null;
  // Not all devices allow choosing output
  audiooutput?: string;
  mediaStreamInput: MediaStream | null;
  mediaStreamVideoInput: MediaStream | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  connectionState: RTCPeerConnectionState | null;
  audioElements: HTMLAudioElement[] | null;
  videoElements: HTMLVideoElement[] | null;
  sessionId: string | null;
  hotkeys: Hotkeys;
  dataChannel: RTCDataChannel | null;
  isRemotelyMuted: boolean;
  isRemotelyDisconnected: boolean;
  // Advisory global-mute state (#678), keyed by participant endpointId. Updated
  // from mute-state broadcasts on the conference data channel so the
  // participant list can reflect each participant's current admin-mute state
  // for every client, not just the mute target. Advisory only: it mirrors what
  // an admin asked for and is not server-enforced.
  participantMuteState: Record<string, boolean>;
}

export type TGlobalState = {
  calls: {
    [key: string]: CallState;
  };
  userSettings: TUserSettings | null;
  production: TProduction | null;
  error: ErrorState;
  reloadProductionList: boolean;
  reloadPresetList: boolean;
  devices: DevicesState;
  selectedProductionId: string | null;
  apiError: Error | false;
  websocket: WebSocket | null;
  // Granted role + feature flags when a role password has been requested, or
  // null when no role is held (the default). Never carries the password.
  roleAuth: TRoleAuth | null;
};
