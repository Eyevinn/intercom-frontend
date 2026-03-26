import { useEffect } from "react";
import { useNavigate } from "react-router";
import styled from "@emotion/styled";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { useRefreshAnimation } from "../landing-page/use-refresh-animation";
import { ProductionsList } from "../production-list/productions-list";
import { PageHeader } from "../page-layout/page-header";
import { ManagePresetsList } from "./manage-presets-list";
import { InfoTooltip } from "../info-tooltip/info-tooltip";

const SectionHeader = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 2rem 1.5rem;

  span {
    top: 1px;
  }
`;

const PRODUCTION_LIST_FILTER = { limit: "30", extended: "true" };

export const ManageProductionsPage = ({
  setApiError,
}: {
  setApiError: () => void;
}) => {
  const navigate = useNavigate();
  const [{ apiError, reloadProductionList }, dispatch] = useGlobalState();
  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList(PRODUCTION_LIST_FILTER);

  const showRefreshing = useRefreshAnimation({
    reloadProductionList,
    doInitialLoad,
  });

  useEffect(() => {
    if (productions && productions.productions.length === 0 && !doInitialLoad) {
      navigate("/");
    }
  }, [productions, doInitialLoad, navigate]);

  useEffect(() => {
    if (apiError) {
      setApiError();
    }
  }, [apiError, setApiError]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIntervalLoad(true);
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [setIntervalLoad]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: "PRESET_UPDATED" });
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [dispatch]);

  return (
    <>
      <PageHeader title="Manage" loading={showRefreshing} hasNavigateToRoot />
      {!!productions?.productions.length && (
        <>
          <SectionHeader>
            Productions
            <InfoTooltip>
              A <strong>production</strong> is a named group of communication
              lines
            </InfoTooltip>
          </SectionHeader>
          <ProductionsList
            productions={productions.productions}
            error={error}
            managementMode
          />
        </>
      )}
      <ManagePresetsList productions={productions?.productions ?? []} />
    </>
  );
};
