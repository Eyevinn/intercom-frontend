import { TJoinProductionOptions } from "../components/production-line/types.ts";

export type TGlobalStateAction =
  | TPublishError
  | TProductionCreated
  | TProductionListFetched
  | TUpdateDevicesAction
  | TUpdateJoinProductionOptions
  | TMediaStream;

export type TPublishError = {
  type: "ERROR";
  payload: Error | null;
};

export type TProductionCreated = {
  type: "PRODUCTION_CREATED";
};

export type TProductionListFetched = {
  type: "PRODUCTION_LIST_FETCHED";
};

export type TUpdateDevicesAction = {
  type: "DEVICES_UPDATED";
  payload: MediaDeviceInfo[];
};

export type TUpdateJoinProductionOptions = {
  type: "UPDATE_JOIN_PRODUCTION_OPTIONS";
  payload: TJoinProductionOptions | null;
};

export type TMediaStream = {
  type: "CONNECTED_MEDIASTREAM";
  payload: MediaStream | null;
};
