import { handleFetchRequest } from "./handle-fetch-request.ts";

const API_VERSION = import.meta.env.VITE_BACKEND_API_VERSION ?? "api/v1/";
const API_URL =
  `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "")}/${API_VERSION}` ||
  `${window.location.origin}/${API_VERSION}`;
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;

type TCreateProductionOptions = {
  name: string;
  lines: { name: string; programOutputLine?: boolean }[];
};

type TParticipant = {
  name: string;
  sessionId: string;
  endpointId: string;
  isActive: boolean;
  isWhip: boolean;
};

type TLine = {
  name: string;
  id: string;
  smbConferenceId: string;
  participants: TParticipant[];
  programOutputLine?: boolean;
};

export type TBasicProductionResponse = {
  name: string;
  productionId: string;
  lines: TLine[];
};

export type TIngest = {
  _id: string;
  label?: string;
  ipAddress?: string;
  deviceInput?: {
    name: string;
    label: string;
  }[];
  deviceOutput?: {
    name: string;
    label: string;
  }[];
};

export type TListIngestResponse = {
  ingests: TIngest[];
  offset: 0;
  limit: 0;
  totalItems: 0;
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

export type TShareUrlOptions = {
  path: string;
};

type TShareUrlResponse = {
  url: string;
};

type TUpdateProductionNameOptions = {
  productionId: string;
  name: string;
};

type TUpdateLineNameOptions = {
  productionId: string;
  lineId: string;
  name: string;
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
  updateProductionName: async ({
    productionId,
    name,
  }: TUpdateProductionNameOptions) =>
    handleFetchRequest<TBasicProductionResponse>(
      fetch(`${API_URL}production/${productionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          name,
        }),
      })
    ),
  updateLineName: async ({
    productionId,
    lineId,
    name,
  }: TUpdateLineNameOptions) =>
    handleFetchRequest<TBasicProductionResponse>(
      fetch(`${API_URL}production/${productionId}/line/${lineId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          name,
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
  fetchProduction: (id: number): Promise<TBasicProductionResponse> =>
    handleFetchRequest<TBasicProductionResponse>(
      fetch(`${API_URL}production/${id}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  deleteProduction: (id: string): Promise<string> =>
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
  addProductionLine: (
    productionId: string,
    name: string,
    programOutputLine?: boolean
  ): Promise<TLine> =>
    handleFetchRequest<TLine>(
      fetch(`${API_URL}production/${productionId}/line`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          name,
          programOutputLine,
        }),
      })
    ),
  deleteProductionLine: (
    productionId: string,
    lineId: string
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
  shareUrl: ({ path }: TShareUrlOptions): Promise<TShareUrlResponse> => {
    return handleFetchRequest<TShareUrlResponse>(
      fetch(`${API_URL}share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          path,
        }),
      })
    );
  },
  reauth: async (): Promise<void> => {
    return handleFetchRequest<void>(
      fetch(`${API_URL}reauth`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    );
  },
  fetchIngestList: (): Promise<TListIngestResponse> =>
    handleFetchRequest<TListIngestResponse>(
      fetch(`${API_URL}ingest`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  createIngest: async (data: { label: string; ipAddress: string }) =>
    handleFetchRequest<boolean>(
      fetch(`${API_URL}ingest/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          label: data.label,
          ipAddress: data.ipAddress,
        }),
      })
    ),
  fetchIngest: (id: number): Promise<TIngest> =>
    handleFetchRequest<TIngest>(
      fetch(`${API_URL}ingest/${id}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  updateIngest: async (data: TIngest) =>
    handleFetchRequest<TIngest>(
      fetch(`${API_URL}ingest/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          label: data.label,
          deviceInput: data.deviceInput?.[0],
          deviceOutput: data.deviceOutput?.[0],
        }),
      })
    ),
  deleteIngest: async (id: string): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}ingest/${id}`, {
        method: "DELETE",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
};
