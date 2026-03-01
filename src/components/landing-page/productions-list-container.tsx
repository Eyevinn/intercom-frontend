import { useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { useFetchProductionList } from "./use-fetch-production-list.ts";
import { ProductionsList } from "../production-list/productions-list.tsx";
import { PageHeader } from "../page-layout/page-header.tsx";
import { AddIcon, EditIcon, HeadsetIcon } from "../../assets/icons/icon.tsx";
import { PrimaryButton } from "../form-elements/form-elements";
import { HideOnSmallScreen } from "../generic-components";

const HeaderButton = styled(PrimaryButton)`
  margin-left: 1rem;
  padding: 1rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
  }

  svg {
    fill: #1a1a1a;
    height: 2rem;
    width: 2rem;
  }
`;

const HeaderButtonText = styled.p`
  display: inline-block;
  margin-right: 0.5rem;
  font-weight: bold;
`;

const ManageButton = styled(HeaderButton)`
  background: transparent;
  border: 0.2rem solid rgba(89, 203, 232, 1);
  color: rgba(89, 203, 232, 1);
  box-shadow: none;

  svg {
    fill: rgba(89, 203, 232, 1);
  }

  &:hover {
    background: rgba(89, 203, 232, 0.1);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  color: rgba(255, 255, 255, 0.6);

  svg {
    width: 4.8rem;
    height: 4.8rem;
    fill: rgba(89, 203, 232, 0.4);
    margin-bottom: 1.5rem;
  }
`;

const EmptyStateText = styled.p`
  font-size: 1.8rem;
  margin-bottom: 2rem;
`;

const EmptyStateButton = styled(PrimaryButton)`
  font-size: 1.6rem;
  padding: 1rem 2rem;
`;

export const ProductionsListContainer = () => {
  const [{ reloadProductionList }] = useGlobalState();
  const navigate = useNavigate();

  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList({
      limit: "30",
      extended: "true",
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

  const goToCreate = () => {
    navigate("/create-production");
  };

  const goToManage = () => {
    navigate("/manage-productions");
  };

  return (
    <>
      <PageHeader title="Productions" loading={showRefreshing}>
        {!!productions?.productions.length && (
          <HideOnSmallScreen>
            <ManageButton onClick={goToManage}>
              <HeaderButtonText>Manage</HeaderButtonText>
              <EditIcon />
            </ManageButton>
            <HeaderButton onClick={goToCreate}>
              <HeaderButtonText>Create</HeaderButtonText>
              <AddIcon />
            </HeaderButton>
          </HideOnSmallScreen>
        )}
      </PageHeader>
      {productions && !productions.productions.length && (
        <EmptyState>
          <HeadsetIcon />
          <EmptyStateText>No productions yet</EmptyStateText>
          <EmptyStateButton onClick={goToCreate}>
            Create your first production
          </EmptyStateButton>
        </EmptyState>
      )}
      {!!productions?.productions.length && (
        <ProductionsList productions={productions.productions} error={error} />
      )}
    </>
  );
};
