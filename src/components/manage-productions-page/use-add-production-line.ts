import { API } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

type AddProductionLineParams = {
  productionId: string;
  name: string;
  programOutputLine: boolean;
};

export const useAddProductionLine = (
  productionId: string | null,
  line: { name: string; programOutputLine: boolean } | null
) => {
  return useRequest<AddProductionLineParams, void>({
    params:
      productionId && line
        ? {
            productionId,
            name: line.name,
            programOutputLine: line.programOutputLine,
          }
        : null,
    apiCall: async (p) => {
      await API.addProductionLine(p.productionId, p.name, p.programOutputLine);
    },
    errorMessage: (p) => `Failed to add production line: ${p.name}`,
  });
};
