export type TJoinProductionOptions = {
  productionId: string;
  lineId: string;
  username: string;
  // Not all devices have input available
  audioinput: string | "no-device";
  // Not all devices allow choosing output
  audiooutput: string | null;
};

export type TParticipant = {
  name: string;
  sessionId: string;
  endpointId: string;
  isActive: boolean;
};

export type TLine = {
  name: string;
  id: string;
  participants: TParticipant[];
};

export type TBasicProduction = {
  name: string;
  productionId: string;
};

export type TProduction = TBasicProduction & {
  lines: TLine[];
};
