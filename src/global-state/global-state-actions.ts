import { TProduction } from "../components/production/types.ts";

export type TGlobalStateAction =
  | TUpdateProductionAction
  | TPublishError
  | TUpdateDevicesAction
  | TUpdateJoinProductionOptions;

export type TUpdateProductionAction = {
  type: "UPDATE_PRODUCTION";
  payload: TProduction;
};

export type TPublishError = {
  type: "ERROR";
  payload: Error;
};

export type TUpdateDevicesAction = {
  type: "DEVICES_UPDATED";
  payload: MediaDeviceInfo[];
};

export type TUpdateJoinProductionOptions = {
  type: "UPDATE_JOIN_PRODUCTION_OPTIONS";
  payload: TJoinProductionOptions;
};
