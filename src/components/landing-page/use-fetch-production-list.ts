import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API, TListProductionsResponse } from "../../api/api.ts";
import { maybeRedirectToAuth } from "../../api/redirect-on-auth-failure.ts";

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
          if (aborted) return;

          setIntervalLoad(false);
          setDoInitialLoad(false);

          const { status } = e as Error & { status?: number };
          if (status === 401) {
            // Give reauth its chance first; only redirect to the OSC login URL
            // (when the AUTH build-time var is set) once reauth itself fails.
            API.reauth().catch((reauthError) => {
              const reauthStatus = (reauthError as Error & { status?: number })
                .status;
              maybeRedirectToAuth(reauthStatus ?? 401);
              // If no redirect is configured, the next interval poll will retry.
            });
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
