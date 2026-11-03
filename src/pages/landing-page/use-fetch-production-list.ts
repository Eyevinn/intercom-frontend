import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API, TListProductionsResponse } from "../../api/api.ts";
import { authCircuitBreaker } from "../../api/auth-circuit-breaker.ts";

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
    const shouldFetch =
      reloadProductionList ||
      intervalLoad ||
      doInitialLoad ||
      // offset-param is never present on launch-page
      (filter?.offset ? manageProdPaginationUpdate : false);

    if (shouldFetch && !authCircuitBreaker.isActive()) {
      // A global auth failure is being coordinated by the circuit breaker
      // (reauth in flight or failed). Skip this cycle rather than firing a
      // request that would just 401 again; the next interval tick retries once
      // the breaker is healthy.
      setIntervalLoad(false);
      setDoInitialLoad(false);
    } else if (shouldFetch) {
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
          if (aborted) return;

          setIntervalLoad(false);
          setDoInitialLoad(false);

          const { status } = e as Error & { status?: number };
          if (status === 401 || !authCircuitBreaker.isActive()) {
            // 401s are handled centrally by the auth circuit breaker (tripped in
            // handleFetchRequest), which runs a single coordinated reauth and
            // pauses all polling — do not surface an error or trigger an
            // independent reauth from here.
            return;
          }

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
