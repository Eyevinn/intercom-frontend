import { Dispatch, Reducer, useReducer } from "react";
import { TGlobalStateAction } from "./global-state-actions";
import { TGlobalState } from "./types";

const initialGlobalState: TGlobalState = {
  production: null,
};

const globalReducer: Reducer<TGlobalState, TGlobalStateAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "UPDATE_PRODUCTION":
      return {
        ...state,
        production: action.payload.production,
      };
    default:
      return state;
  }
};

export const useInitializeGlobalStateReducer = (): [
  TGlobalState,
  Dispatch<TGlobalStateAction>,
] => useReducer(globalReducer, initialGlobalState);
