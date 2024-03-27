import { TProduction } from "../components/production/types.ts";

export type TGlobalState = TGlobalProductionState & TError;

export type TGlobalProductionState = {
  production: TProduction | null;
  //  selectedInput: string | null;
  //  selectedOutput: string | null;
};

export type TError = {
  error: Error | null;
};
