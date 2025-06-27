import { useState } from "react";
import { useEditLineName } from "../manage-productions-page/use-edit-line-name";
import { useEditProductionName } from "../manage-productions-page/use-edit-production-name";

type EditActions = {
  editProductionName: (productionId: string, name: string) => void;
  editLineName: (productionId: string, lineId: string, name: string) => void;
  isLoading: (type: string, lineId?: string) => boolean;
  isSuccess: boolean;
};

export const useEditActions = (): EditActions => {
  const [editProductionParams, setEditProductionParams] = useState<{
    productionId: string;
    name: string;
  } | null>(null);

  const [editLineParams, setEditLineParams] = useState<{
    productionId: string;
    lineId: string;
    name: string;
  } | null>(null);

  const { loading: editProductionLoading, success: editProductionSuccess } =
    useEditProductionName(editProductionParams);

  const { loading: editLineLoading, success: editLineSuccess } =
    useEditLineName(editLineParams);

  const editProductionName = (productionId: string, name: string) => {
    setEditProductionParams({ productionId, name });
  };

  const editLineName = (productionId: string, lineId: string, name: string) => {
    setEditLineParams({ productionId, lineId, name });
  };

  const isLoading = (type: string, lineId?: string) => {
    if (type === "productionName") return editProductionLoading;
    if (type.startsWith("lineName-") && lineId) return editLineLoading;
    return false;
  };

  return {
    editProductionName,
    editLineName,
    isLoading,
    isSuccess: editProductionSuccess || editLineSuccess,
  };
};
