import { Dispatch, Reducer, useReducer } from "react";
import { TGlobalStateAction } from "./global-state-actions";
import { TGlobalState } from "./types";

const initialGlobalState: TGlobalState = {
  production: null,
  error: { callErrors: null, globalError: null },
  reloadProductionList: false,
  devices: {
    input: null,
    output: null,
  },
  userSettings: null,
  selectedProductionId: null,
  calls: {},
  apiError: false,
  websocket: null,
  clients: [],
  currentClient: null,
  p2pCalls: {},
  activeTalks: {},
};

const globalReducer: Reducer<TGlobalState, TGlobalStateAction> = (
  state,
  action
): TGlobalState => {
  // Simple Debug
  // logger.cyan(
  //   `Global state action: ${action.type}, payload: ${action.payload}`
  // );
  switch (action.type) {
    case "ERROR": {
      const { callId, error } = action.payload;

      if (callId && error) {
        // Call-specific error
        return {
          ...state,
          error: {
            ...state.error,
            callErrors: {
              ...state.error.callErrors,
              [callId]: error,
            },
          },
        };
      }
      // Global error
      return {
        ...state,
        error: {
          ...state.error,
          globalError: error,
        },
      };
    }
    case "PRODUCTION_UPDATED":
      return {
        ...state,
        reloadProductionList: true,
      };
    case "API_NOT_AVAILABLE":
      return {
        ...state,
        apiError: new Error("API not available"),
      };
    case "PRODUCTION_LIST_FETCHED":
      return {
        ...state,
        reloadProductionList: false,
      };
    case "DEVICES_UPDATED":
      return {
        ...state,
        devices: action.payload,
      };
    case "SELECT_PRODUCTION_ID":
      return {
        ...state,
        selectedProductionId: action.payload,
      };
    case "ADD_CALL":
      return {
        ...state,
        calls: {
          ...state.calls,
          [action.payload.id]: action.payload.callState,
        },
      };
    case "UPDATE_CALL":
      if (
        action.payload.updates.audioLevelAboveThreshold &&
        state.calls[action.payload.id].audioLevelAboveThreshold ===
          action.payload.updates.audioLevelAboveThreshold
      )
        return state;
      return {
        ...state,
        calls: {
          ...state.calls,
          [action.payload.id]: {
            ...state.calls[action.payload.id],
            ...action.payload.updates,
          },
        },
      };
    case "REMOVE_CALL": {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { [action.payload.id]: _, ...remainingCalls } = state.calls;

      return {
        ...state,
        calls: remainingCalls,
        production: null,
      };
    }
    case "UPDATE_USER_SETTINGS":
      return {
        ...state,
        userSettings: action.payload,
      };
    case "SET_WEBSOCKET":
      return {
        ...state,
        websocket: action.payload,
      };
    case "SET_CLIENTS":
      return {
        ...state,
        clients: action.payload,
      };
    case "CLIENT_CONNECTED": {
      const exists = state.clients.some(
        (c) => c.clientId === action.payload.clientId
      );
      return {
        ...state,
        clients: exists
          ? state.clients.map((c) =>
              c.clientId === action.payload.clientId ? action.payload : c
            )
          : [...state.clients, action.payload],
      };
    }
    case "CLIENT_DISCONNECTED":
      return {
        ...state,
        clients: state.clients.filter(
          (c) => c.clientId !== action.payload.clientId
        ),
      };
    case "SET_CURRENT_CLIENT":
      return {
        ...state,
        currentClient: action.payload,
      };
    case "CALL_INCOMING": {
      const { callId, callerId, callerName } = action.payload;
      return {
        ...state,
        p2pCalls: {
          ...state.p2pCalls,
          [callId]: {
            callId,
            callerId,
            callerName,
            calleeId: state.currentClient?.clientId || "",
            calleeName: state.currentClient?.name || "",
            direction: "incoming" as const,
            state: "setting_up" as const,
            peerConnection: null,
            audioElement: null,
          },
        },
      };
    }
    case "CALL_STARTED": {
      const { callId } = action.payload;
      if (!state.p2pCalls[callId]) return state;
      return {
        ...state,
        p2pCalls: {
          ...state.p2pCalls,
          [callId]: {
            ...state.p2pCalls[callId],
            state: "active" as const,
          },
        },
      };
    }
    case "CALL_ENDED": {
      const { callId } = action.payload;
      const call = state.p2pCalls[callId];
      if (!call) return state;
      // Clean up WebRTC resources
      if (call.peerConnection) {
        call.peerConnection.close();
      }
      if (call.audioElement) {
        call.audioElement.srcObject = null;
      }
      const { [callId]: _, ...remainingP2PCalls } = state.p2pCalls;
      return {
        ...state,
        p2pCalls: remainingP2PCalls,
      };
    }
    case "SET_P2P_CALL":
      return {
        ...state,
        p2pCalls: {
          ...state.p2pCalls,
          [action.payload.callId]: action.payload,
        },
      };
    case "UPDATE_P2P_CALL": {
      const existing = state.p2pCalls[action.payload.callId];
      if (!existing) return state;
      return {
        ...state,
        p2pCalls: {
          ...state.p2pCalls,
          [action.payload.callId]: {
            ...existing,
            ...action.payload.updates,
          },
        },
      };
    }
    case "REMOVE_P2P_CALL": {
      const { [action.payload.callId]: _, ...rest } = state.p2pCalls;
      return {
        ...state,
        p2pCalls: rest,
      };
    }
    case "TALK_STARTED": {
      const { clientId, clientName, targets, timestamp } = action.payload;
      return {
        ...state,
        activeTalks: {
          ...state.activeTalks,
          [clientId]: {
            clientId,
            clientName,
            targets,
            startedAt: timestamp,
          },
        },
      };
    }
    case "TALK_STOPPED": {
      const { clientId } = action.payload;
      const { [clientId]: _, ...remainingTalks } = state.activeTalks;
      return {
        ...state,
        activeTalks: remainingTalks,
      };
    }
    case "SET_ACTIVE_TALKS": {
      const talksRecord: Record<string, typeof action.payload[number]> = {};
      for (const talk of action.payload) {
        talksRecord[talk.clientId] = talk;
      }
      return {
        ...state,
        activeTalks: talksRecord,
      };
    }
    default:
      return state;
  }
};

export const useInitializeGlobalStateReducer = (): [
  TGlobalState,
  Dispatch<TGlobalStateAction>,
] => useReducer(globalReducer, initialGlobalState);
