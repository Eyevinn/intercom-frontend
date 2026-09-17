import { API, TSavedTransmitter } from "../api/api";
import { useBridgeConfig } from "./use-bridge-config";
import { useLineBridges } from "./use-line-bridges";

type TUseLineInputsOptions = {
  productionId: string | null;
  lineId: string | null;
};

export const useLineInputs = ({
  productionId,
  lineId,
}: TUseLineInputsOptions) => {
  const { config } = useBridgeConfig();
  const { bridges, busyId, error, start, stop, refresh } =
    useLineBridges<TSavedTransmitter>({
      productionId,
      lineId,
      enabled: !!config?.transmittersEnabled,
      fetchList: API.fetchTransmitterList,
      updateState: API.updateTransmitterState,
    });

  return { transmitters: bridges, busyId, error, start, stop, refresh };
};
