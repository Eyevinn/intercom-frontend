export type TJoinProductionOptions = {
  productionId: string;
  lineId: string;
  username: string;
  audioinput: string;
  audiooutput: string;
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

export type TProduction = {
  name: string;
  id: number;
  lines: TLine[];
};