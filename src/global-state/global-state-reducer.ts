import { Dispatch, Reducer, useReducer } from "react";
import { TGlobalStateAction } from "./global-state-actions";
import { TGlobalState } from "./types";
import { uniqBy } from "../helpers";

const initialGlobalState: TGlobalState = {
  production: null,
  error: null,
  devices: null,
};

const globalReducer: Reducer<TGlobalState, TGlobalStateAction> = (
  state,
  action
) => {
  // Simple Debug
  // console.log(action.type, action.payload);
  switch (action.type) {
    case "UPDATE_PRODUCTION":
      return {
        ...state,
        production: action.payload,
        error: null,
      };
    case "ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "DEVICES_UPDATED":
      return {
        ...state,
        devices: uniqBy(action.payload, (item) => item.deviceId),
      };

    default:
      return state;
  }
};

export const useInitializeGlobalStateReducer = (): [
  TGlobalState,
  Dispatch<TGlobalStateAction>,
] => useReducer(globalReducer, initialGlobalState);
