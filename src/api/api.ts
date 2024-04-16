import { handleFetchRequest } from "./handle-fetch-request.ts";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? "";

type TCreateProductionOptions = {
  name: string;
  lines: { name: string }[];
};

type TParticipant = {
  name: string;
  sessionid: string;
  isActive: boolean;
};

type TLine = {
  name: string;
  id: string;
  smbconferenceid: string;
  participants: TParticipant[];
};

type TBasicProductionResponse = {
  name: string;
  productionid: string;
};

type TFetchProductionResponse = TBasicProductionResponse & {
  lines: TLine[];
};

type TListProductionsResponse = TBasicProductionResponse[];

type TOfferAudioSessionOptions = {
  productionId: number;
  lineId: number;
  username: string;
};

type TOfferAudioSessionResponse = {
  sdp: string;
  sessionid: string;
};

type TPatchAudioSessionOptions = {
  productionId: number;
  lineId: number;
  sessionId: string;
  sdpAnswer: string;
};

type TPatchAudioSessionResponse = null;

type TDeleteAudioSessionOptions = {
  productionId: number;
  lineId: number;
  sessionId: string;
};

type THeartbeatOptions = {
  sessionId: string;
};

export const API = {
  createProduction: async ({ name, lines }: TCreateProductionOptions) =>
    handleFetchRequest<TBasicProductionResponse>(
      fetch(`${API_URL}production/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          lines,
        }),
      })
    ),
  listProductions: (): Promise<TListProductionsResponse> =>
    handleFetchRequest<TListProductionsResponse>(
      fetch(`${API_URL}productions/`, { method: "GET" })
    ),
  fetchProduction: (id: number): Promise<TFetchProductionResponse> =>
    handleFetchRequest<TFetchProductionResponse>(
      fetch(`${API_URL}productions/${id}`, { method: "GET" })
    ),
  deleteProduction: (id: number): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}productions/${id}`, { method: "DELETE" })
    ),
  listProductionLines: (id: number) =>
    handleFetchRequest<TLine[]>(
      fetch(`${API_URL}productions/${id}/lines`, { method: "GET" })
    ),
  fetchProductionLine: (productionId: number, lineId: number): Promise<TLine> =>
    handleFetchRequest<TLine>(
      fetch(`${API_URL}productions/${productionId}/lines/${lineId}`, {
        method: "GET",
      })
    ),
  offerAudioSession: ({
    productionId,
    lineId,
    username,
  }: TOfferAudioSessionOptions): Promise<TOfferAudioSessionResponse> =>
    handleFetchRequest<TOfferAudioSessionResponse>(
      fetch(
        `${API_URL}productions/${productionId}/lines/${lineId}/users/${username}`,
        { method: "POST" }
      )
    ),
  patchAudioSession: ({
    productionId,
    lineId,
    sessionId,
    sdpAnswer,
  }: TPatchAudioSessionOptions): Promise<TPatchAudioSessionResponse> =>
    handleFetchRequest<TPatchAudioSessionResponse>(
      fetch(
        `${API_URL}productions/${productionId}/lines/${lineId}/session/${sessionId}`,
        {
          method: "PATCH",
          body: sdpAnswer,
        }
      )
    ),
  deleteAudioSession: ({
    productionId,
    lineId,
    sessionId,
  }: TDeleteAudioSessionOptions): Promise<string> =>
    handleFetchRequest<string>(
      fetch(
        `${API_URL}productions/${productionId}/lines/${lineId}/session/${sessionId}`,
        { method: "DELETE" }
      )
    ),
  heartbeat: ({ sessionId }: THeartbeatOptions): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}heartbeat/${sessionId}`, { method: "GET" })
    ),
};
