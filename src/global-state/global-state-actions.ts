import { TProduction } from "../components/production/types.ts";

export type TGlobalStateAction = TUpdateProductionAction;

export type TUpdateProductionAction = {
  type: "UPDATE_PRODUCTION";
  payload: TProduction;
};
