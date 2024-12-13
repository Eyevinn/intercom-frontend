import { CallState } from "./types.ts";

export type TGlobalStateAction =
  | TPublishError
  | TProductionCreated
  | TApiNotAvailable
  | TProductionListFetched
  | TUpdateDevicesAction
  | TSelectProductionId
  | TAddCallState
  | TUpdateCallState
  | TRemoveCallState;

export type TPublishError = {
  type: "ERROR";
  payload: { callId?: string; error: Error | null };
};

export type TProductionCreated = {
  type: "PRODUCTION_UPDATED";
};

export type TApiNotAvailable = {
  type: "API_NOT_AVAILABLE";
};

export type TProductionListFetched = {
  type: "PRODUCTION_LIST_FETCHED";
};

export type TUpdateDevicesAction = {
  type: "DEVICES_UPDATED";
  payload: MediaDeviceInfo[];
};

export type TSelectProductionId = {
  type: "SELECT_PRODUCTION_ID";
  payload: string | null;
};

export type TAddCallState = {
  type: "ADD_CALL";
  payload: { id: string; callState: CallState };
};

export type TUpdateCallState = {
  type: "UPDATE_CALL";
  payload: { id: string; updates: Partial<CallState> };
};

export type TRemoveCallState = {
  type: "REMOVE_CALL";
  payload: { id: string };
};
