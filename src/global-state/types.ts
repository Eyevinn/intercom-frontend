import { MutableRefObject } from "react";
import {
  TJoinProductionOptions,
  TProduction,
} from "../components/production-line/types.ts";

export interface ErrorState {
  globalError?: Error | null;
  callErrors?: Record<string, Error> | null;
}

export interface CallState {
  id: string;
  peerConnection: MutableRefObject<RTCPeerConnection | null> | null;
  production: TProduction | null;
  reloadProductionList: boolean;
  devices: MediaDeviceInfo[] | null;
  joinProductionOptions: TJoinProductionOptions | null;
  mediaStreamInput: MediaStream | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
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
