import { TProduction } from "../components/production/types.ts";

export type TGlobalState = {
  production: TProduction | null;
  error: Error | null;
  devices: MediaDeviceInfo[] | null;
  //  selectedInput: string | null;
  //  selectedOutput: string | null;
};
