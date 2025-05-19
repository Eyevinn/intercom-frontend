import { API, TBasicProductionResponse } from "../../api/api";
import { useRequest } from "../../hooks/use-request";

export type FormValues = {
  productionName: string;
  defaultLine: string;
  defaultLineProgramOutput: boolean;
  lines: { name: string; programOutputLine?: boolean }[];
};

type CreateProductionParams = {
  name: string;
  lines: { name: string; programOutputLine?: boolean }[];
};

export const useCreateProduction = ({
  createNewProduction,
}: {
  createNewProduction: FormValues | null;
}) => {
  return useRequest<CreateProductionParams, TBasicProductionResponse>({
    params: createNewProduction
      ? {
          name: createNewProduction.productionName,
          lines: [
            {
              name: createNewProduction.defaultLine,
              programOutputLine: createNewProduction.defaultLineProgramOutput,
            },
            ...createNewProduction.lines,
          ],
        }
      : null,
    apiCall: API.createProduction,
    errorMessage: (p) => `Failed to create production: ${p.name}`,
  });
};
