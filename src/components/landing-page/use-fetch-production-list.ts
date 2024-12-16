import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API, TListProductionsResponse } from "../../api/api.ts";

export type GetProductionListFilter = {
  limit?: string;
  offset?: string;
  extended?: string;
};

export const useFetchProductionList = (filter?: GetProductionListFilter) => {
  const [productions, setProductions] = useState<TListProductionsResponse>();
  const [doInitialLoad, setDoInitialLoad] = useState(true);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [{ reloadProductionList }, dispatch] = useGlobalState();

  const manageProdPaginationUpdate =
    filter?.offset !== productions?.offset.toString();

  // TODO improve performance: this makes the call 3 times
  useEffect(() => {
    let aborted = false;
    if (
      reloadProductionList ||
      intervalLoad ||
      doInitialLoad ||
      // offset-param is never present on launch-page
      (filter?.offset ? manageProdPaginationUpdate : false)
    ) {
      const searchParams = new URLSearchParams(filter).toString();
      API.listProductions({ searchParams })
        .then((result) => {
          if (aborted) return;

          setProductions(result);

          dispatch({
            type: "PRODUCTION_LIST_FETCHED",
          });

          setIntervalLoad(false);
          setDoInitialLoad(false);
          setError(null);
        })
        .catch((e) => {
          dispatch({
            type: "API_NOT_AVAILABLE",
          });
          setError(
            e instanceof Error
              ? e
              : new Error("Failed to fetch production list.")
          );
        });
    }

    return () => {
      aborted = true;
    };
  }, [
    dispatch,
    intervalLoad,
    reloadProductionList,
    doInitialLoad,
    filter,
    manageProdPaginationUpdate,
  ]);

  return {
    productions,
    doInitialLoad,
    error,
    setIntervalLoad,
  };
};
