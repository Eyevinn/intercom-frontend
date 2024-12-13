import {
  TJoinProductionOptions,
  TProduction,
} from "../components/production-line/types.ts";

export interface ErrorState {
  globalError?: Error | null;
  callErrors?: Record<string, Error> | null;
}

export interface CallState {
  production: TProduction | null;
  reloadProductionList: boolean;
  devices: MediaDeviceInfo[] | null;
  joinProductionOptions: TJoinProductionOptions | null;
  mediaStreamInput: MediaStream | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  connectionState: RTCPeerConnectionState | null;
  audioElements: HTMLAudioElement[] | null;
  sessionId: string | null;
}

export type TGlobalState = {
  calls: {
    [key: string]: CallState;
  };
  production: TProduction | null;
  error: ErrorState;
  reloadProductionList: boolean;
  devices: MediaDeviceInfo[] | null;
  selectedProductionId: string | null;
  apiError: Error | false;
};
