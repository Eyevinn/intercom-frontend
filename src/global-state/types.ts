import {
  Hotkeys,
  TJoinProductionOptions,
  TProduction,
} from "../components/production-line/types.ts";
import { TUserSettings } from "../components/user-settings/types.ts";

export interface ErrorState {
  globalError?: Error | null;
  callErrors?: Record<string, Error> | null;
}

export interface DevicesState {
  input: MediaDeviceInfo[] | null;
  output: MediaDeviceInfo[] | null;
}

export interface CallState {
  joinProductionOptions: TJoinProductionOptions | null;
  // Not all devices allow choosing output
  audiooutput?: string;
  mediaStreamInput: MediaStream | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  connectionState: RTCPeerConnectionState | null;
  audioElements: HTMLAudioElement[] | null;
  sessionId: string | null;
  hotkeys: Hotkeys;
  dataChannel: RTCDataChannel | null;
  isRemotelyMuted: boolean;
}

export type TGlobalState = {
  calls: {
    [key: string]: CallState;
  };
  userSettings: TUserSettings | null;
  production: TProduction | null;
  error: ErrorState;
  reloadProductionList: boolean;
  devices: DevicesState;
  selectedProductionId: string | null;
  apiError: Error | false;
  websocket: WebSocket | null;
};
