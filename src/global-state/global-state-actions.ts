export type TGlobalStateAction = TUpdateProductionAction;

export type TUpdateProductionAction = {
  type: "UPDATE_PRODUCTION";
  payload: { production: string };
};
