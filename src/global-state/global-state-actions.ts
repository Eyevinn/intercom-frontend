import { TClientProfile } from "../components/client-registry/types.ts";
import { TUserSettings } from "../components/user-settings/types.ts";
import { CallState, DevicesState } from "./types.ts";

// P2P Call types (M2)
export type TP2PCall = {
  callId: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  direction: "incoming" | "outgoing";
  state: "setting_up" | "active" | "ended";
  peerConnection: RTCPeerConnection | null;
  audioElement: HTMLAudioElement | null;
};

export type TCallIncoming = {
  type: "CALL_INCOMING";
  payload: {
    callId: string;
    callerId: string;
    callerName: string;
    callerRole: string;
    callerLocation: string;
  };
};

export type TCallStarted = {
  type: "CALL_STARTED";
  payload: {
    callId: string;
    callerId: string;
    callerName: string;
    calleeId: string;
    calleeName: string;
  };
};

export type TCallEnded = {
  type: "CALL_ENDED";
  payload: {
    callId: string;
    reason: string;
  };
};

export type TSetP2PCall = {
  type: "SET_P2P_CALL";
  payload: TP2PCall;
};

export type TUpdateP2PCall = {
  type: "UPDATE_P2P_CALL";
  payload: {
    callId: string;
    updates: Partial<TP2PCall>;
  };
};

export type TRemoveP2PCall = {
  type: "REMOVE_P2P_CALL";
  payload: { callId: string };
};

// M3 Talk state types
export type TTalkTarget = {
  clientId: string;
  clientName: string;
  callId: string;
};

export type TActiveTalk = {
  clientId: string;
  clientName: string;
  targets: TTalkTarget[];
  startedAt: string;
};

export type TTalkStarted = {
  type: "TALK_STARTED";
  payload: {
    clientId: string;
    clientName: string;
    targets: TTalkTarget[];
    timestamp: string;
  };
};

export type TTalkStopped = {
  type: "TALK_STOPPED";
  payload: {
    clientId: string;
    clientName: string;
    timestamp: string;
  };
};

export type TSetActiveTalks = {
  type: "SET_ACTIVE_TALKS";
  payload: TActiveTalk[];
};

export type TGlobalStateAction =
  | TPublishError
  | TProductionCreated
  | TApiNotAvailable
  | TProductionListFetched
  | TUpdateUserSettings
  | TUpdateDevicesAction
  | TSelectProductionId
  | TAddCallState
  | TUpdateCallState
  | TRemoveCallState
  | TSetWebSocket
  | THeartbeatError
  | TSetClients
  | TClientConnected
  | TClientDisconnected
  | TSetCurrentClient
  | TCallIncoming
  | TCallStarted
  | TCallEnded
  | TSetP2PCall
  | TUpdateP2PCall
  | TRemoveP2PCall
  | TTalkStarted
  | TTalkStopped
  | TSetActiveTalks;

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

export type TSetClients = {
  type: "SET_CLIENTS";
  payload: TClientProfile[];
};

export type TClientConnected = {
  type: "CLIENT_CONNECTED";
  payload: TClientProfile;
};

export type TClientDisconnected = {
  type: "CLIENT_DISCONNECTED";
  payload: { clientId: string };
};

export type TSetCurrentClient = {
  type: "SET_CURRENT_CLIENT";
  payload: {
    clientId: string;
    name: string;
    role: string;
    location: string;
  } | null;
};
