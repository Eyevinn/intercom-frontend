import { API, TBasicProductionResponse } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

type EditLineNameParams = {
  productionId: string;
  lineId: string;
  name: string;
};

export const useEditLineName = (params: EditLineNameParams | null) => {
  return useRequest<EditLineNameParams, TBasicProductionResponse>({
    params,
    apiCall: API.updateLineName,
    errorMessage: (p) => `Failed to edit line name: ${p.name}`,
  });
};
