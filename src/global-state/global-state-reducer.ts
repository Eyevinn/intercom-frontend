import { Dispatch, Reducer, useReducer } from "react";
import { TGlobalStateAction } from "./global-state-actions";
import { TGlobalState } from "./types";

const initialGlobalState: TGlobalState = {
  production: null,
  error: null,
  reloadProductionList: false,
  devices: null,
  joinProductionOptions: null,
  mediaStreamInput: null,
  dominantSpeaker: null,
  audioLevelAboveThreshold: false,
  selectedProductionId: null,
  apiError: false,
};

const globalReducer: Reducer<TGlobalState, TGlobalStateAction> = (
  state,
  action
): TGlobalState => {
  // Simple Debug
  // console.log(action.type, action.payload);
  switch (action.type) {
    case "ERROR":
      return {
        ...state,
        error: action.payload,
      };
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
    case "UPDATE_JOIN_PRODUCTION_OPTIONS":
      return {
        ...state,
        joinProductionOptions: action.payload,
      };
    case "CONNECTED_MEDIASTREAM":
      return {
        ...state,
        mediaStreamInput: action.payload,
      };
    case "DOMINANT_SPEAKER":
      return {
        ...state,
        dominantSpeaker: action.payload,
      };
    case "AUDIO_LEVEL_ABOVE_THRESHOLD":
      // Don't update state if receiving the same value
      if (state.audioLevelAboveThreshold === action.payload) return state;

      return {
        ...state,
        audioLevelAboveThreshold: action.payload,
      };
    case "SELECT_PRODUCTION_ID":
      return {
        ...state,
        selectedProductionId: action.payload,
      };
    default:
      return state;
  }
};

export const useInitializeGlobalStateReducer = (): [
  TGlobalState,
  Dispatch<TGlobalStateAction>,
] => useReducer(globalReducer, initialGlobalState);
