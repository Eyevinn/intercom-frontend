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
  active: boolean;
};

export type TLine = {
  name: string;
  id: number;
  connected: boolean;
  participants: TParticipant[];
};

export type TBasicProduction = {
  name: string;
  id: number;
};

export type TProduction = TBasicProduction & {
  lines: TLine[];
};
