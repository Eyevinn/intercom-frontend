import {
  TJoinProductionOptions,
  TProduction,
} from "../components/production-line/types.ts";

export type TGlobalState = {
  production: TProduction | null;
  error: Error | null;
  reloadProductionList: boolean;
  devices: MediaDeviceInfo[] | null;
  joinProductionOptions: TJoinProductionOptions | null;
  mediaStreamInput: MediaStream | null;
  dominantSpeaker: string | null;
  audioLevelAboveThreshold: boolean;
  selectedProductionId: string | null;
  apiError: Error | false;
};
