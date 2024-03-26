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

// TODO create generic response/error converter and response data validator
export const API = {
  createProduction: ({
    name,
    lines,
  }: TCreateProductionOptions): Promise<TCreateProductionResponse> =>
    fetch(`${rootUrl}production/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        lines,
      }),
    }).then((response) => response.json()),
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
