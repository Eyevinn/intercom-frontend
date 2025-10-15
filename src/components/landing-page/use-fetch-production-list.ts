import { useEffect, useState, useRef } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API, TListProductionsResponse } from "../../api/api.ts";
import logger from "../../utils/logger.ts";

export type GetProductionListFilter = {
  limit?: string;
  offset?: string;
  extended?: string;
};

const MAX_CONSECUTIVE_401_ERRORS = 10;

export const useFetchProductionList = (filter?: GetProductionListFilter) => {
  const [productions, setProductions] = useState<TListProductionsResponse>();
  const [doInitialLoad, setDoInitialLoad] = useState(true);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const consecutive401ErrorsRef = useRef(0);
  const isPollingActiveRef = useRef(true);

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

    if (shouldFetch) {
      // Check if polling is active for interval loads
      if (intervalLoad && !isPollingActiveRef.current) {
        setIntervalLoad(false);
        return;
      }

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

          // Reset error counter on successful fetch
          consecutive401ErrorsRef.current = 0;
        })
        .catch((e) => {
          if (aborted) return;

          const errorMessage = e instanceof Error ? e.message : String(e);

          // Check if this is a 401 unauthorized error
          if (errorMessage.includes("Response Code: 401")) {
            consecutive401ErrorsRef.current += 1;

            logger.red(`Production list 401 error (${consecutive401ErrorsRef.current}/${MAX_CONSECUTIVE_401_ERRORS}): ${errorMessage}`);

            // Stop polling after max consecutive 401 errors
            if (consecutive401ErrorsRef.current >= MAX_CONSECUTIVE_401_ERRORS) {
              isPollingActiveRef.current = false;
              logger.red(`Production list polling stopped after ${MAX_CONSECUTIVE_401_ERRORS} consecutive 401 errors. Reauthentication required.`);
              setIntervalLoad(false);
              return;
            }
          } else {
            // Reset 401 counter for non-401 errors
            consecutive401ErrorsRef.current = 0;
          }

          // Handle errors as before
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

  // Enhanced setIntervalLoad that respects polling state
  const setIntervalLoadWithBackoff = (value: boolean) => {
    if (value && !isPollingActiveRef.current) {
      // Don't trigger interval load if polling is stopped due to 401 errors
      return;
    }
    setIntervalLoad(value);
  };

  // Reset polling state when reloadProductionList or doInitialLoad changes
  useEffect(() => {
    if (reloadProductionList || doInitialLoad) {
      consecutive401ErrorsRef.current = 0;
      isPollingActiveRef.current = true;
    }
  }, [reloadProductionList, doInitialLoad]);

  return {
    productions,
    doInitialLoad,
    error,
    setIntervalLoad: setIntervalLoadWithBackoff,
  };
};