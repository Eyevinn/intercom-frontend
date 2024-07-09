import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { API } from "../../api/api.ts";
import { TBasicProduction } from "../production-line/types.ts";

export const useFetchProductionList = () => {
  const [productions, setProductions] = useState<TBasicProduction[]>([]);
  const [allProductions, setAllProductions] = useState<TBasicProduction[]>([]);
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
              // pick last 10 items
              .slice(0, 10)
          );

          setAllProductions(result);

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
    allProductions,
    productions,
    doInitialLoad,
    error,
    setIntervalLoad,
  };
};
