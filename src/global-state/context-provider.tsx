import { Dispatch, createContext, useContext } from "react";
import { TGlobalState } from "./types";
import { TGlobalStateAction } from "./global-state-actions.ts";

type TGlobalStateContextProviderValue = [
  state: TGlobalState,
  dispatch: Dispatch<TGlobalStateAction>,
];
export const GlobalStateContext =
  createContext<TGlobalStateContextProviderValue>(
    {} as TGlobalStateContextProviderValue
  );

export const useGlobalState = (): TGlobalStateContextProviderValue =>
  useContext(GlobalStateContext);
