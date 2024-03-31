import {
  TJoinProductionOptions,
  TProduction,
} from "../components/production-line/types.ts";

export type TGlobalState = {
  production: TProduction | null;
  error: Error | null;
  devices: MediaDeviceInfo[] | null;
  joinProductionOptions: TJoinProductionOptions | null;
};
