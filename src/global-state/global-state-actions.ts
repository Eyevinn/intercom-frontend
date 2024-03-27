import { TProduction } from "../components/production/types.ts";

export type TGlobalStateAction =
  | TUpdateProductionAction
  | TPublishError
  | TUpdateDevicesAction;

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
