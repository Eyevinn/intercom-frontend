import { TProduction } from "../components/production/types.ts";

export type TGlobalStateAction = TUpdateProductionAction | TPublishError;

export type TUpdateProductionAction = {
  type: "UPDATE_PRODUCTION";
  payload: TProduction;
};

export type TPublishError = {
  type: "ERROR";
  payload: Error;
};
