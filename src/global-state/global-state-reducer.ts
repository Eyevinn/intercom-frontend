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
};

const globalReducer: Reducer<TGlobalState, TGlobalStateAction> = (
  state,
  action
): TGlobalState => {
  // Simple Debug
  // console.log(action.type, action.payload);
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
    default:
      return state;
  }
};

export const useInitializeGlobalStateReducer = (): [
  TGlobalState,
  Dispatch<TGlobalStateAction>,
] => useReducer(globalReducer, initialGlobalState);
