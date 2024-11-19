import { handleFetchRequest } from "./handle-fetch-request.ts";

const API_VERSION = import.meta.env.VITE_BACKEND_API_VERSION ?? "api/v1/";
const API_URL =
  `${import.meta.env.VITE_BACKEND_URL}${API_VERSION}` ||
  `${window.location.origin}/${API_VERSION}`;
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;

type TCreateProductionOptions = {
  name: string;
  lines: { name: string }[];
};

type TParticipant = {
  name: string;
  sessionId: string;
  endpointId: string;
  isActive: boolean;
};

type TLine = {
  name: string;
  id: string;
  smbConferenceId: string;
  participants: TParticipant[];
};

type TBasicProductionResponse = {
  name: string;
  productionId: string;
};

type TFetchProductionResponse = TBasicProductionResponse & {
  lines: TLine[];
};

export type TListProductionsResponse = {
  productions: TBasicProductionResponse[];
  offset: 0;
  limit: 0;
  totalItems: 0;
};

type TOfferAudioSessionOptions = {
  productionId: number;
  lineId: number;
  username: string;
};

type TOfferAudioSessionResponse = {
  sdp: string;
  sessionId: string;
};

type TPatchAudioSessionOptions = {
  sessionId: string;
  sdpAnswer: string;
};

type TPatchAudioSessionResponse = null;

type TDeleteAudioSessionOptions = {
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
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          name,
          lines,
        }),
      })
    ),
  listProductions: ({
    searchParams,
  }: {
    searchParams: string;
  }): Promise<TListProductionsResponse> =>
    handleFetchRequest<TListProductionsResponse>(
      fetch(`${API_URL}productionlist?${searchParams}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  fetchProduction: (id: number): Promise<TFetchProductionResponse> =>
    handleFetchRequest<TFetchProductionResponse>(
      fetch(`${API_URL}production/${id}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  deleteProduction: (id: number): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}production/${id}`, {
        method: "DELETE",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  listProductionLines: (id: number) =>
    handleFetchRequest<TLine[]>(
      fetch(`${API_URL}production/${id}/line`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  fetchProductionLine: (productionId: number, lineId: number): Promise<TLine> =>
    handleFetchRequest<TLine>(
      fetch(`${API_URL}production/${productionId}/line/${lineId}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  addProductionLine: (productionId: number, name: string): Promise<TLine> =>
    handleFetchRequest<TLine>(
      fetch(`${API_URL}production/${productionId}/line`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          name,
        }),
      })
    ),
  deleteProductionLine: (
    productionId: number,
    lineId: number
  ): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}production/${productionId}/line/${lineId}`, {
        method: "DELETE",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  offerAudioSession: ({
    productionId,
    lineId,
    username,
  }: TOfferAudioSessionOptions): Promise<TOfferAudioSessionResponse> =>
    handleFetchRequest<TOfferAudioSessionResponse>(
      fetch(`${API_URL}session/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          productionId,
          lineId,
          username,
        }),
      })
    ),
  patchAudioSession: ({
    sessionId,
    sdpAnswer,
  }: TPatchAudioSessionOptions): Promise<TPatchAudioSessionResponse> =>
    handleFetchRequest<TPatchAudioSessionResponse>(
      fetch(`${API_URL}session/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          sdpAnswer,
        }),
      })
    ),
  deleteAudioSession: ({
    sessionId,
  }: TDeleteAudioSessionOptions): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}session/${sessionId}`, {
        method: "DELETE",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  heartbeat: ({ sessionId }: THeartbeatOptions): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}heartbeat/${sessionId}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
};
