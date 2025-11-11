import { handleFetchRequest } from "./handle-fetch-request.ts";

const API_VERSION = import.meta.env.VITE_BACKEND_API_VERSION ?? "api/v1/";
const API_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "")}/${API_VERSION}`
  : `${window.location.origin}/${API_VERSION}`;
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY;

// Helper to get backend base URL for constructing WHIP/WHEP URLs
export const getBackendBaseUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "")
    : window.location.origin;
};

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

export type TSavedTransmitter = {
  _id: string;
  label?: string;
  port: number;
  productionId: number;
  lineId: number;
  whipUrl: string;
  passThroughUrl?: string;
  mode: "caller" | "listener";
  srtUrl?: string;
  status: "idle" | "running" | "stopped" | "failed";
  createdAt?: string;
  updatedAt?: string;
};

export type TSavedReceiver = {
  _id: string;
  label?: string;
  productionId: number;
  lineId: number;
  whepUrl: string;
  srtUrl: string;
  status: "idle" | "running" | "stopped" | "failed";
  createdAt?: string;
  updatedAt?: string;
};

export enum TSrtMode {
  CALLER = "caller",
  LISTENER = "listener",
}

export enum TBridgeState {
  IDLE = "idle",
  RUNNING = "running",
  STOPPED = "stopped",
  FAILED = "failed",
}

export type TEditTransmitter = {
  id: string;
  state: TBridgeState;
};

export type TEditReceiver = {
  id: string;
  state: TBridgeState;
};

export type TPatchTransmitter = {
  id: string;
  label?: string;
  productionId?: number;
  lineId?: number;
};

export type TPatchReceiver = {
  id: string;
  label?: string;
  productionId?: number;
  lineId?: number;
};

export type TBridgeConfig = {
  whipGatewayEnabled: boolean;
  whepGatewayEnabled: boolean;
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

  // Bridge configuration
  fetchBridgeConfig: (): Promise<TBridgeConfig> =>
    handleFetchRequest<TBridgeConfig>(
      fetch(`${API_URL}bridge/config`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),

  // Transmitter (Bridge TX) endpoints - via intercom-manager
  createTransmitter: async (data: {
    label?: string;
    port: number;
    productionId: number;
    lineId: number;
    whipUrl: string;
    passThroughUrl?: string;
    mode: "caller" | "listener";
    srtUrl?: string;
  }) =>
    handleFetchRequest<TSavedTransmitter>(
      fetch(`${API_URL}bridge/tx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify(data),
      })
    ),
  fetchTransmitterList: (): Promise<TSavedTransmitter[]> =>
    handleFetchRequest<{ transmitters: TSavedTransmitter[] }>(
      fetch(`${API_URL}bridge/tx`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ).then((res) => res?.transmitters || []),
  fetchTransmitter: (id: string): Promise<TSavedTransmitter> =>
    handleFetchRequest<TSavedTransmitter>(
      fetch(`${API_URL}bridge/tx/${id}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  updateTransmitterState: async (data: TEditTransmitter) =>
    handleFetchRequest<TSavedTransmitter>(
      fetch(`${API_URL}bridge/tx/${data.id}/state`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          desired: data.state,
        }),
      })
    ),
  updateTransmitter: async (data: TPatchTransmitter) =>
    handleFetchRequest<TSavedTransmitter>(
      fetch(`${API_URL}bridge/tx/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          label: data.label,
          productionId: data.productionId,
          lineId: data.lineId,
        }),
      })
    ),
  deleteTransmitter: async (id: string): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}bridge/tx/${id}`, {
        method: "DELETE",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),

  // Receiver (Bridge RX) endpoints - via intercom-manager
  createReceiver: async (data: {
    label?: string;
    productionId: number;
    lineId: number;
    whepUrl: string;
    srtUrl: string;
  }) =>
    handleFetchRequest<TSavedReceiver>(
      fetch(`${API_URL}bridge/rx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify(data),
      })
    ),
  fetchReceiverList: (): Promise<TSavedReceiver[]> =>
    handleFetchRequest<{ receivers: TSavedReceiver[] }>(
      fetch(`${API_URL}bridge/rx`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ).then((res) => res?.receivers || []),
  fetchReceiver: (id: string): Promise<TSavedReceiver> =>
    handleFetchRequest<TSavedReceiver>(
      fetch(`${API_URL}bridge/rx/${id}`, {
        method: "GET",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
  updateReceiverState: async (data: TEditReceiver) =>
    handleFetchRequest<TSavedReceiver>(
      fetch(`${API_URL}bridge/rx/${data.id}/state`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          desired: data.state,
        }),
      })
    ),
  updateReceiver: async (data: TPatchReceiver) =>
    handleFetchRequest<TSavedReceiver>(
      fetch(`${API_URL}bridge/rx/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          label: data.label,
          productionId: data.productionId,
          lineId: data.lineId,
        }),
      })
    ),
  deleteReceiver: async (id: string): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}bridge/rx/${id}`, {
        method: "DELETE",
        headers: {
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
      })
    ),
};
