import { useCallback, useEffect, useRef, useState } from "react";
import { TBridgeState } from "../api/api";

const POLL_INTERVAL_MS = 3000;

type TBridge = {
  _id: string;
  label?: string;
  status: "idle" | "running" | "stopped" | "failed";
};

type TUseLineBridgesOptions<T extends TBridge> = {
  productionId: string | null;
  lineId: string | null;
  enabled: boolean;
  fetchList: (filter: { productionId: string; lineId: string }) => Promise<T[]>;
  updateState: (data: { id: string; state: TBridgeState }) => Promise<unknown>;
};

export const useLineBridges = <T extends TBridge>({
  productionId,
  lineId,
  enabled,
  fetchList,
  updateState,
}: TUseLineBridgesOptions<T>) => {
  const [bridges, setBridges] = useState<T[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const fetchListRef = useRef(fetchList);
  const updateStateRef = useRef(updateState);

  fetchListRef.current = fetchList;
  updateStateRef.current = updateState;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const active = enabled && !!productionId && !!lineId;

  const refresh = useCallback(async () => {
    if (!active || !productionId || !lineId) return;
    try {
      const list = await fetchListRef.current({ productionId, lineId });
      if (!mountedRef.current) return;
      setBridges(list);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e : new Error("Failed to fetch bridges"));
    }
  }, [active, productionId, lineId]);

  useEffect(() => {
    if (!active) {
      setBridges([]);
      return undefined;
    }
    refresh();
    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [active, refresh]);

  const runAction = useCallback(
    async (id: string, state: TBridgeState) => {
      setBusyId(id);
      setError(null);
      try {
        await updateStateRef.current({ id, state });
        await refresh();
      } catch (e) {
        if (mountedRef.current) {
          setError(e instanceof Error ? e : new Error("Bridge action failed"));
        }
      } finally {
        if (mountedRef.current) setBusyId(null);
      }
    },
    [refresh]
  );

  const start = useCallback(
    (id: string) => runAction(id, TBridgeState.RUNNING),
    [runAction]
  );

  const stop = useCallback(
    (id: string) => runAction(id, TBridgeState.STOPPED),
    [runAction]
  );

  return { bridges, busyId, error, start, stop, refresh };
};
