import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { useFetchProductionList } from "./use-fetch-production-list.ts";
import { ProductionsList } from "../production-list/productions-list.tsx";
import { ProductionsListHeader } from "./production-list-header.tsx";

export const ProductionsListContainer = () => {
  const [{ reloadProductionList }] = useGlobalState();

  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList({
      limit: "10",
      extended: "true",
    });

  const showRefreshing = useRefreshAnimation({
    reloadProductionList,
    doInitialLoad,
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIntervalLoad(true);
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [setIntervalLoad]);

  return (
    <>
      <ProductionsListHeader
        loading={showRefreshing}
        hasProductions={!!productions?.productions.length}
      />
      {!!productions?.productions.length && (
        <ProductionsList productions={productions.productions} error={error} />
      )}
    </>
  );
};
