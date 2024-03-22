export type TParticipant = {
  name: string;
  active: boolean;
};

export type TLine = {
  name: string;
  connected: boolean;
  connectionId: string;
  participants: TParticipant[];
};

export type TProduction = {
  name: string;
  lines: TLine[];
};
