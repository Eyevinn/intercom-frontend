import { API, TSavedReceiver } from "../api/api";
import { useBridgeConfig } from "./use-bridge-config";
import { useLineBridges } from "./use-line-bridges";

type TUseLineOutputsOptions = {
  productionId: string | null;
  lineId: string | null;
};

export const useLineOutputs = ({
  productionId,
  lineId,
}: TUseLineOutputsOptions) => {
  const { config } = useBridgeConfig();
  const { bridges, busyId, error, start, stop, refresh } =
    useLineBridges<TSavedReceiver>({
      productionId,
      lineId,
      enabled: !!config?.receiversEnabled,
      fetchList: API.fetchReceiverList,
      updateState: API.updateReceiverState,
    });

  return { receivers: bridges, busyId, error, start, stop, refresh };
};
