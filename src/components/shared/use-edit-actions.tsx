import { useState } from "react";
import { useEditLineName } from "../manage-productions-page/use-edit-line-name";
import { useEditProductionName } from "../manage-productions-page/use-edit-production-name";
import { useEditIngest } from "../ingests-page/use-edit-ingest";
import { TIngest } from "../../api/api";

type EditActions = {
  editProductionName: (productionId: string, name: string) => void;
  editLineName: (productionId: string, lineId: string, name: string) => void;
  editIngestLabel: (ingest: TIngest, label: string) => void;
  editIngestDevice: (
    ingest: TIngest,
    deviceType: "input" | "output",
    currentLabel: string,
    newLabel: string
  ) => void;
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

  const [editIngestParams, setEditIngestParams] = useState<TIngest | null>(
    null
  );

  const { loading: editProductionLoading, success: editProductionSuccess } =
    useEditProductionName(editProductionParams);

  const { loading: editLineLoading, success: editLineSuccess } =
    useEditLineName(editLineParams);

  const { loading: editIngestLoading, success: editIngestSuccess } =
    useEditIngest(editIngestParams);

  const editProductionName = (productionId: string, name: string) => {
    setEditProductionParams({ productionId, name });
  };

  const editLineName = (productionId: string, lineId: string, name: string) => {
    setEditLineParams({ productionId, lineId, name });
  };

  const editIngestLabel = (ingest: TIngest, label: string) => {
    setEditIngestParams({ _id: ingest._id, label });
  };

  const editIngestDevice = (
    ingest: TIngest,
    deviceType: "input" | "output",
    currentLabel: string,
    newLabel: string
  ) => {
    const deviceArray =
      deviceType === "input" ? ingest.deviceInput : ingest.deviceOutput;
    const updatedDevices = deviceArray?.find((d) => d.label === currentLabel);

    setEditIngestParams({
      _id: ingest._id,
      deviceInput:
        updatedDevices && deviceType === "input"
          ? [
              {
                name: updatedDevices.name,
                label: newLabel,
              },
            ]
          : undefined,
      deviceOutput:
        updatedDevices && deviceType === "output"
          ? [
              {
                name: updatedDevices.name,
                label: newLabel,
              },
            ]
          : undefined,
    });
  };

  const isLoading = (type: string, lineId?: string) => {
    if (type === "productionName") return editProductionLoading;
    if (type === "ingestLabel" || type === "currentDeviceLabel")
      return editIngestLoading;
    if (type.startsWith("lineName-") && lineId) return editLineLoading;
    return false;
  };

  return {
    editProductionName,
    editLineName,
    editIngestLabel,
    editIngestDevice,
    isLoading,
    isSuccess: editProductionSuccess || editLineSuccess || editIngestSuccess,
  };
};
