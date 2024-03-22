export type TParticipant = {
  name: string;
  active: boolean;
};

export type TLine = {
  name: string;
  id: number;
  connected: boolean;
  connectionId: string;
  participants: TParticipant[];
};

export type TProduction = {
  name: string;
  id: number;
  lines: TLine[];
};
