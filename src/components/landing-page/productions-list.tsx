import styled from "@emotion/styled";
import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { LoaderDots } from "../loader/loader.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import { DisplayContainer } from "../generic-components.ts";
import { ManageProductionButton } from "./manage-production-button.tsx";
import { LocalError } from "../error.tsx";
import { useFetchProductionList } from "./use-fetch-production-list.ts";

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
  const [{ reloadProductionList }] = useGlobalState();

  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList();

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
      {!!productions.length && <ManageProductionButton />}
    </>
  );
};
