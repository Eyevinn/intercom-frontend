import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { API } from "../../api/api.ts";
import { TBasicProduction } from "../production-line/types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { LoaderDots } from "../loader/loader.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import { DisplayContainer } from "../generic-components.ts";
// import { ManageProductionButton } from "./manage-production-button.tsx";
import { LocalError } from "../error.tsx";

const ProductionListContainer = styled.div`
  display: flex;
  padding: 0 0 2rem 2rem;
  flex-wrap: wrap;
`;

const HeaderContainer = styled(DisplayContainer)`
  padding: 0 2rem 0 2rem;
`;

const ProductionItem = styled.div`
  flex: 1 0 calc(25% - 2rem);
  min-width: 20rem;
  border: 1px solid #424242;
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 0 2rem 2rem 0;
`;

const ProductionName = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0 0 1rem;
  word-break: break-word;
`;

const ProductionId = styled.div`
  font-size: 2rem;
  color: #9e9e9e;
`;

export const ProductionsList = () => {
  const [productions, setProductions] = useState<TBasicProduction[]>([]);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(false);
  const [{ reloadProductionList }, dispatch] = useGlobalState();
  const [doInitialLoad, setDoInitialLoad] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO extract to separate hook file
  useEffect(() => {
    let aborted = false;

    if (reloadProductionList || intervalLoad || doInitialLoad) {
      API.listProductions()
        .then((result) => {
          if (aborted) return;

          setProductions(
            result
              // pick laste 10 items
              .slice(-10)
              // display in reverse order
              .toReversed()
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
  }, []);

  return (
    <>
      <LoaderDots
        className={showRefreshing ? "active" : "in-active"}
        text="refreshing"
      />
      <HeaderContainer>
        <DisplayContainerHeader>Production List</DisplayContainerHeader>
      </HeaderContainer>
      <ProductionListContainer>
        {error && <LocalError error={error} />}
        {!error &&
          productions.map((p) => (
            <ProductionItem key={p.productionid}>
              <ProductionName>{p.name}</ProductionName>
              <ProductionId>{p.productionid}</ProductionId>
            </ProductionItem>
          ))}
      </ProductionListContainer>
      {/* --> TODO disabled for demo only! <-- !!productions.length && <ManageProductionButton /> */}
    </>
  );
};
