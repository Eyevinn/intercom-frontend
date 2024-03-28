const API_URL = import.meta.env.VITE_BASE_URL ?? "";

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

  if (!contentType) {
    throw new Error("No content-type on response. Report to your developer.");
  }

  if (contentType.indexOf("text/plain") > -1) {
    text = await response.text();
  } else if (contentType.indexOf("application/json") > -1) {
    json = await response.json();
  }

  const isSuccess = isSuccessful(response);

  if (!isSuccess) {
    if (text) {
      throw new Error(text);
    }

    if ("message" in json) {
      throw new Error(json.message);
    }

    throw new Error(
      `Response Code: ${response.status} - ${response.statusText}.`
    );
  }

  console.log("Request response:", json);

  if (!json) {
    throw new Error(`No response data. Response text: ${text}`);
  }

  return json;
};

// TODO create generic response/error converter and response data validator
export const API = {
  createProduction: async ({ name, lines }: TCreateProductionOptions) =>
    handleFetchRequest<TCreateProductionResponse>(
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
  // TODO add response types, headers, handleFetchRequest
  deleteProduction: (id: number) =>
    fetch(`${API_URL}productions/${id}`, { method: "DELETE" }).then(
      (response) => response.json()
    ),
  listProductionLines: (id: number) =>
    fetch(`${API_URL}productions/${id}/lines`, { method: "GET" }).then(
      (response) => response.json()
    ),
  fetchProductionLine: (productionId: number, lineId: number): Promise<TLine> =>
    fetch(`${API_URL}productions/${productionId}/lines/${lineId}`, {
      method: "GET",
    }).then((response) => response.json()),
  offerAudioSession: () => Promise.resolve(),
  patchAudioSession: () => Promise.resolve(),
  deleteAudioSession: () => Promise.resolve(),
};
