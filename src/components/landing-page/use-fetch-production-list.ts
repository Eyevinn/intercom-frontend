import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API, TListProductionsResponse } from "../../api/api.ts";

export type GetProductionListFilter = {
  limit?: string;
  offset?: string;
};

export const useFetchProductionList = (filter?: GetProductionListFilter) => {
  const [productions, setProductions] = useState<TListProductionsResponse>();
  const [doInitialLoad, setDoInitialLoad] = useState(true);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [{ reloadProductionList }, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;

    if (
      reloadProductionList ||
      intervalLoad ||
      doInitialLoad ||
      filter?.offset !== productions?.offset.toString()
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
    productions?.offset,
  ]);

  return {
    productions,
    doInitialLoad,
    error,
    setIntervalLoad,
  };
};
