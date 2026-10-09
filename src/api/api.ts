import { handleFetchRequest } from "./handle-fetch-request.ts";
import { getBackendUrl } from "../utils/runtime-config.ts";

const API_VERSION = import.meta.env.VITE_BACKEND_API_VERSION ?? "api/v1/";
const API_URL = `${getBackendUrl()}/${API_VERSION}`;

// NOTE (#625): the frontend never holds the manager API key. All `VITE_*` env
// vars are public — compiled into the browser bundle at build time and readable
// from DevTools — so a static API key must never be read here. Management
// endpoints are authenticated by the OSC platform session instead: the browser
// talks to the manager same-origin, the short-lived `*.sat` session cookie
// (renewed by the `/reauth` flow) rides along automatically with every request,
// and the platform attaches the real credential server-side. `fetch` defaults
// to `credentials: "same-origin"`, so that cookie is sent without any extra
// configuration here.

export type TPresetCall = {
  productionId: string;
  lineId: string;
  lineUsedForProgramOutput?: boolean;
  isProgramUser?: boolean;
  lineName?: string;
};

export type TPreset = {
  _id: string;
  name: string;
  calls: TPresetCall[];
  createdAt: string;
  isLocal?: boolean;
  companionUrl?: string;
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

type TForceDisconnectParticipantOptions = {
  productionId: string;
  lineId: string;
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
  updateProductionName: async ({
    productionId,
    name,
  }: TUpdateProductionNameOptions) =>
    handleFetchRequest<TBasicProductionResponse>(
      fetch(`${API_URL}production/${productionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
      })
    ),
  fetchProduction: (id: number): Promise<TBasicProductionResponse> =>
    handleFetchRequest<TBasicProductionResponse>(
      fetch(`${API_URL}production/${id}`, {
        method: "GET",
      })
    ),
  deleteProduction: (id: string): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}production/${id}`, {
        method: "DELETE",
      })
    ),
  listProductionLines: (id: number) =>
    handleFetchRequest<TLine[]>(
      fetch(`${API_URL}production/${id}/line`, {
        method: "GET",
      })
    ),
  fetchProductionLine: (productionId: number, lineId: number): Promise<TLine> =>
    handleFetchRequest<TLine>(
      fetch(`${API_URL}production/${productionId}/line/${lineId}`, {
        method: "GET",
      })
    ),
  // Long poll endpoint: the request is held open by the manager until the
  // participant list changes or a server-side timeout elapses, then resolves
  // with the current participants. Callers re-issue it in a loop.
  fetchLineParticipants: (
    productionId: number,
    lineId: number,
    signal?: AbortSignal
  ): Promise<TParticipant[]> =>
    handleFetchRequest<TParticipant[]>(
      fetch(
        `${API_URL}production/${productionId}/line/${lineId}/participants`,
        {
          method: "POST",
          signal,
        }
      )
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
      })
    ),

  // Force-disconnect (kick) a participant from a line by their backend
  // session id. The manager expires the participant's SMB endpoint, removes
  // the session and notifies the line, so the kicked participant leaves for
  // everyone. Admin-side action — calls the HTTP endpoint directly.
  forceDisconnectParticipant: ({
    productionId,
    lineId,
    sessionId,
  }: TForceDisconnectParticipantOptions): Promise<string> =>
    handleFetchRequest<string>(
      fetch(
        `${API_URL}production/${productionId}/line/${lineId}/participants/${sessionId}/disconnect`,
        {
          method: "POST",
        }
      )
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
      })
    ),
  heartbeat: ({ sessionId }: THeartbeatOptions): Promise<string> =>
    handleFetchRequest<string>(
      fetch(`${API_URL}heartbeat/${sessionId}`, {
        method: "GET",
      })
    ),
  shareUrl: ({ path }: TShareUrlOptions): Promise<TShareUrlResponse> => {
    return handleFetchRequest<TShareUrlResponse>(
      fetch(`${API_URL}share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      })
    );
  },
  createPreset: (options: {
    name: string;
    calls: TPresetCall[];
    companionUrl?: string;
  }): Promise<TPreset> =>
    handleFetchRequest<TPreset>(
      fetch(`${API_URL}preset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })
    ),
  listPresets: (): Promise<{ presets: TPreset[] }> =>
    handleFetchRequest<{ presets: TPreset[] }>(
      fetch(`${API_URL}preset`, {
        method: "GET",
      })
    ),
  deletePreset: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}preset/${id}`, {
      method: "DELETE",
    });
    if (!response.ok || response.status !== 204) {
      await handleFetchRequest<void>(Promise.resolve(response));
    }
  },
  updatePreset: (
    id: string,
    update: {
      name?: string;
      calls?: TPresetCall[];
      companionUrl?: string | null;
    }
  ): Promise<TPreset> =>
    handleFetchRequest<TPreset>(
      fetch(`${API_URL}preset/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      })
    ),
};
