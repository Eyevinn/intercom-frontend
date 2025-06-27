import { useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { useFetchProductionList } from "./use-fetch-production-list.ts";
import { ProductionsList } from "../production-list/productions-list.tsx";
import { PageHeader } from "../page-layout/page-header.tsx";
import { AddIcon, EditIcon } from "../../assets/icons/icon.tsx";
import { PrimaryButton } from "../form-elements/form-elements";
import { isMobile } from "../../bowser.ts";

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
    fill: #482307;
    height: 2rem;
    width: 2rem;
  }
`;

const HeaderButtonText = styled.p`
  display: inline-block;
  margin-right: 0.5rem;
  font-weight: bold;
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
        {!isMobile && (
          <>
            {!!productions?.productions.length && (
              <HeaderButton onClick={goToManage}>
                <HeaderButtonText>Manage</HeaderButtonText>
                <EditIcon />
              </HeaderButton>
            )}
            <HeaderButton onClick={goToCreate}>
              <HeaderButtonText>Create</HeaderButtonText>
              <AddIcon />
            </HeaderButton>
          </>
        )}
      </PageHeader>
      {!!productions?.productions.length && (
        <ProductionsList productions={productions.productions} error={error} />
      )}
    </>
  );
};
