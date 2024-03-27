import { TProduction } from "../components/production/types.ts";
import { TError } from "./types.ts";

export type TGlobalStateAction = TUpdateProductionAction | TPublishError;

export type TUpdateProductionAction = {
  type: "UPDATE_PRODUCTION";
  payload: TProduction;
};

export type TPublishError = {
  type: "ERROR";
  payload: TError;
};
