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

  const json = await response.json();

  const isSuccess = isSuccessful(response);

  if (!isSuccess) {
    if ("message" in json) {
      throw new Error(json.message);
    }

    throw new Error(
      `Response Code: ${response.status} - ${response.statusText}.`
    );
  }

  console.log(json);

  return json;
};

// TODO create generic response/error converter and response data validator
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
  // TODO add response types, headers
  listProductions: (): Promise<TListProductionsResponse> =>
    fetch(`${rootUrl}productions/`, { method: "GET" }).then((response) =>
      response.json()
    ),
  fetchProduction: (id: number): Promise<TFetchProductionResponse> =>
    fetch(`${rootUrl}productions/${id}`, { method: "GET" }).then((response) =>
      response.json()
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
  offerAudioSession: () => Promise.resolve(),
  patchAudioSession: () => Promise.resolve(),
  deleteAudioSession: () => Promise.resolve(),
};
