// TODO env variable
const rootUrl = "https://intercom-manager.dev.eyevinn.technology/";

type TCreateProductionOptions = {
  name: string;
  lines: { name: string }[];
};

type TCreateProductionResponse = {
  productionid: string;
};

type TLine = {
  name: string;
  id: string;
  smbid: string;
  connections: unknown;
};

type TFetchProductionResponse = {
  name: string;
  productionid: string;
  lines: TLine[];
};

type TListProductionsResponse = TFetchProductionResponse[];

const isSuccessful = (r: Response) => r.status >= 200 && r.status <= 399;

const handleFetchRequest = async <T>(
  fetchRequest: Promise<Response>
): Promise<T> => {
  const response = await fetchRequest;
  let json = null;
  let text = null;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.indexOf("text/plain") > -1) {
    text = await response.text();
  } else if (contentType && contentType.indexOf("application/json") > -1) {
    json = await response.json();
  }

  const isSuccess = isSuccessful(response);

  if (!isSuccess) {
    if (text) {
      throw new Error(text);
    }

    if (json && "message" in json) {
      throw new Error(json.message);
    }

    throw new Error(
      `Response Code: ${response.status} - ${response.statusText}.`
    );
  }

  console.log("Request response:", text || json);

  return text || json;
};

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

type TPatchAudioSessionResponse = {
  sdp: string;
  sessionid: string;
};

type TDeleteAudioSessionOptions = {
  productionId: number;
  lineId: number;
  sessionId: string;
};

export const API = {
  createProduction: async ({ name, lines }: TCreateProductionOptions) =>
    handleFetchRequest<TCreateProductionResponse>(
      fetch(`${rootUrl}production/`, {
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
      fetch(`${rootUrl}productions/`, { method: "GET" })
    ),
  fetchProduction: (id: number): Promise<TFetchProductionResponse> =>
    handleFetchRequest<TFetchProductionResponse>(
      fetch(`${rootUrl}productions/${id}`, { method: "GET" })
    ),
  deleteProduction: (id: number) =>
    fetch(`${rootUrl}productions/${id}`, { method: "DELETE" }).then(
      (response) => response.json()
    ),
  listProductionLines: (id: number) =>
    fetch(`${rootUrl}productions/${id}/lines`, { method: "GET" }).then(
      (response) => response.json()
    ),
  fetchProductionLine: (productionId: number, lineId: number): Promise<TLine> =>
    fetch(`${rootUrl}productions/${productionId}/lines/${lineId}`, {
      method: "GET",
    }).then((response) => response.json()),
  offerAudioSession: ({
    productionId,
    lineId,
    username,
  }: TOfferAudioSessionOptions): Promise<TOfferAudioSessionResponse> =>
    handleFetchRequest<TOfferAudioSessionResponse>(
      fetch(
        `${rootUrl}productions/${productionId}/lines/${lineId}/users/${username}`,
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
        `${rootUrl}productions/${productionId}/lines/${lineId}/session/${sessionId}`,
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
        `${rootUrl}productions/${productionId}/lines/${lineId}/session/${sessionId}`,
        { method: "DELETE" }
      )
    ),
};
