import styled from "@emotion/styled";
import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { LoaderDots } from "../loader/loader.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import { DisplayContainer } from "../generic-components.ts";
import { ManageProductionButton } from "./manage-production-button.tsx";
import { useFetchProductionList } from "./use-fetch-production-list.ts";
import { ProductionsList } from "../productions-list.tsx";

const HeaderContainer = styled(DisplayContainer)`
  padding: 0 2rem 0 2rem;
`;

const LoaderWrapper = styled.div`
  padding-bottom: 1rem;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0 0 2rem;
`;

export const ProductionsListContainer = () => {
  const [{ reloadProductionList }, dispatch] = useGlobalState();

  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList({
      limit: "10",
    });

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
      <LoaderWrapper>
        <LoaderDots
          className={showRefreshing ? "active" : "in-active"}
          text="refreshing"
        />
      </LoaderWrapper>
      <HeaderContainer>
        <DisplayContainerHeader>Production List</DisplayContainerHeader>
      </HeaderContainer>
      <ListWrapper>
        <ProductionsList
          productions={productions?.productions}
          error={error}
          setProductionId={(input) =>
            dispatch({
              type: "SELECT_PRODUCTION_ID",
              payload: input,
            })
          }
        />
      </ListWrapper>
      {!!productions?.productions.length && <ManageProductionButton />}
    </>
  );
};
