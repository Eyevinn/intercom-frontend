import { TJoinProductionOptions } from "../components/production/types.ts";

export type TGlobalStateAction =
  | TPublishError
  | TUpdateDevicesAction
  | TUpdateJoinProductionOptions;

export type TPublishError = {
  type: "ERROR";
  payload: Error | null;
};

export type TUpdateDevicesAction = {
  type: "DEVICES_UPDATED";
  payload: MediaDeviceInfo[];
};

export type TUpdateJoinProductionOptions = {
  type: "UPDATE_JOIN_PRODUCTION_OPTIONS";
  payload: TJoinProductionOptions | null;
};
