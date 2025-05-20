import { API, TBasicProductionResponse } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

type EditProductionNameParams = {
  productionId: string;
  name: string;
};

export const useEditProductionName = (
  params: EditProductionNameParams | null
) => {
  return useRequest<EditProductionNameParams, TBasicProductionResponse>({
    params,
    apiCall: API.updateProductionName,
    errorMessage: (p) => `Failed to edit production name: ${p.name}`,
  });
};
