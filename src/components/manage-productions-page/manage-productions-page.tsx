import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { useRefreshAnimation } from "../landing-page/use-refresh-animation";
import { ProductionsList } from "../production-list/productions-list";
import { PageHeader } from "../page-layout/page-header";

export const ManageProductionsPage = ({
  setApiError,
}: {
  setApiError: () => void;
}) => {
  const [{ apiError, reloadProductionList }] = useGlobalState();
  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList({
      limit: "30",
      extended: "true",
    });

  const showRefreshing = useRefreshAnimation({
    reloadProductionList,
    doInitialLoad,
  });

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

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
