import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API } from "../../api/api";

type TUseCreateProduction = {
  createNewProduction: FormValues | null;
};

export type FormValues = {
  productionName: string;
  defaultLine: string;
  defaultLineProgramOutput: boolean;
  lines: { name: string; programOutputLine?: boolean }[];
};

export const useCreateProduction = ({
  createNewProduction,
}: TUseCreateProduction) => {
  const [newProduction, setNewProduction] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;

    if (createNewProduction) {
      setLoading(true);
      API.createProduction({
        name: createNewProduction.productionName,
        lines: [
          {
            name: createNewProduction.defaultLine,
            programOutputLine: createNewProduction.defaultLineProgramOutput,
          },
          ...createNewProduction.lines,
        ],
      })
        .then((v) => {
          if (aborted) return;

          setNewProduction(v.productionId);
          setLoading(false);
        })
        .catch((error) => {
          dispatch({
            type: "ERROR",
            payload: error,
          });
          setLoading(false);
        });
    }

    return () => {
      aborted = true;
    };
  }, [createNewProduction, dispatch]);

  return {
    createdProductionId: newProduction,
    loading,
  };
};
