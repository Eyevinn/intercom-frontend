import { TUserSettings } from "../components/ui/user-settings/types.ts";
import { TRoleAuth } from "../api/role-auth-store.ts";
import { CallState, DevicesState } from "./types.ts";

export type TGlobalStateAction =
  | TPublishError
  | TPublishWarning
  | TProductionCreated
  | TApiNotAvailable
  | TProductionListFetched
  | TUpdateUserSettings
  | TUpdateDevicesAction
  | TSelectProductionId
  | TAddCallState
  | TUpdateCallState
  | TUpdateParticipantMuteState
  | TRemoveCallState
  | TSetWebSocket
  | THeartbeatError
  | TPresetUpdated
  | TPresetListFetched
  | TUpdateRoleAuth;

export type TPublishError = {
  type: "ERROR";
  payload: { callId?: string; error: Error | null };
};

export type TPublishWarning = {
  type: "WARNING";
  payload: { message: string | null };
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
  payload: DevicesState;
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

// Advisory global-mute state sync (#678): merge a single participant's
// admin-mute state (keyed by endpointId) into a call's participantMuteState map
// without clobbering the other participants' entries.
export type TUpdateParticipantMuteState = {
  type: "UPDATE_PARTICIPANT_MUTE_STATE";
  payload: { callId: string; participantId: string; muted: boolean };
};

export type TUpdateUserSettings = {
  type: "UPDATE_USER_SETTINGS";
  payload: TUserSettings | null;
};

export type TSetWebSocket = {
  type: "SET_WEBSOCKET";
  payload: WebSocket | null;
};

export type THeartbeatError = {
  type: "HEARTBEAT_ERROR";
  payload: { sessionId: string; error: Error };
};

export type TPresetUpdated = {
  type: "PRESET_UPDATED";
};

export type TPresetListFetched = {
  type: "PRESET_LIST_FETCHED";
};

export type TUpdateRoleAuth = {
  type: "UPDATE_ROLE_AUTH";
  payload: TRoleAuth | null;
};
