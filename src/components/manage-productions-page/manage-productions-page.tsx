import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { useRefreshAnimation } from "../landing-page/use-refresh-animation";
import { ProductionsList } from "../production-list/productions-list";
import { PageHeader } from "../page-layout/page-header";

export const ManageProductionsPage = () => {
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
      <PageHeader
        title="Manage Productions"
        loading={showRefreshing}
        hasNavigateToRoot
      />
      {!!productions?.productions.length && (
        <ProductionsList
          productions={productions.productions}
          error={error}
          managementMode
        />
      )}
    </>
  );
};
