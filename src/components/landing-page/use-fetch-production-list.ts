import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API } from "../../api/api.ts";
import { TBasicProduction } from "../production-line/types.ts";

export const useFetchProductionList = () => {
  const [productions, setProductions] = useState<TBasicProduction[]>([]);
  const [doInitialLoad, setDoInitialLoad] = useState(true);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [{ reloadProductionList }, dispatch] = useGlobalState();

  useEffect(() => {
    let aborted = false;

    if (reloadProductionList || intervalLoad || doInitialLoad) {
      API.listProductions()
        .then((result) => {
          if (aborted) return;

          setProductions(
            result

              // Make sure list is correctly sorted
              .sort(
                (a, b) =>
                  parseInt(b.productionId, 10) - parseInt(a.productionId, 10)
              )
              // pick last 10 items and display newest first
              .slice(0, 10)
          );

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
  }, [dispatch, intervalLoad, reloadProductionList, doInitialLoad]);

  return {
    productions,
    doInitialLoad,
    error,
    setIntervalLoad,
  };
};
