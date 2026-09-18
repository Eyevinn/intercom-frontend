import { useCallback, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { arrayMove } from "@dnd-kit/sortable";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useRefreshAnimation } from "./use-refresh-animation.ts";
import { useFetchProductionList } from "./use-fetch-production-list.ts";
import { ProductionsList } from "../production-list/productions-list.tsx";
import { PageHeader } from "../page-layout/page-header.tsx";
import { AddIcon, EditIcon, HeadsetIcon } from "../../assets/icons/icon.tsx";
import { PrimaryButton } from "../form-elements/form-elements";
import { HideOnSmallScreen } from "../generic-components";
import { PresetList } from "./presets-list";
import { InfoTooltip } from "../info-tooltip/info-tooltip";
import { TBasicProductionResponse } from "../../api/api.ts";
import { sortByName } from "../../utils/sort-by-name.ts";

const SORT_ORDER_KEY = "production-sort-order";

const getSavedOrder = (): string[] => {
  try {
    const saved = localStorage.getItem(SORT_ORDER_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveOrder = (ids: string[]) => {
  localStorage.setItem(SORT_ORDER_KEY, JSON.stringify(ids));
};

const applyStoredOrder = (
  productions: TBasicProductionResponse[]
): TBasicProductionResponse[] => {
  const sorted = sortByName(productions);
  const savedOrder = getSavedOrder();
  if (!savedOrder.length) return sorted;

  const productionMap = new Map(sorted.map((p) => [p.productionId, p]));

  const ordered = savedOrder.reduce<TBasicProductionResponse[]>((acc, id) => {
    const prod = productionMap.get(id);
    if (prod) {
      acc.push(prod);
      productionMap.delete(id);
    }
    return acc;
  }, []);

  return [...ordered, ...productionMap.values()];
};

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

const PRODUCTION_LIST_FILTER = { limit: "30", extended: "true" };

export const ProductionsListContainer = () => {
  const [{ reloadProductionList }, dispatch] = useGlobalState();
  const navigate = useNavigate();

  const { productions, doInitialLoad, error, setIntervalLoad } =
    useFetchProductionList(PRODUCTION_LIST_FILTER);

  const showRefreshing = useRefreshAnimation({
    reloadProductionList,
    doInitialLoad,
  });

  const [orderedProductions, setOrderedProductions] = useState<
    TBasicProductionResponse[]
  >([]);

  useEffect(() => {
    if (productions?.productions.length) {
      setOrderedProductions(applyStoredOrder(productions.productions));
    } else {
      setOrderedProductions([]);
    }
  }, [productions]);

  const handleReorder = useCallback((activeId: string, overId: string) => {
    setOrderedProductions((prev) => {
      const oldIndex = prev.findIndex((p) => p.productionId === activeId);
      const newIndex = prev.findIndex((p) => p.productionId === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const newOrder = arrayMove(prev, oldIndex, newIndex);
      saveOrder(newOrder.map((p) => p.productionId));
      return newOrder;
    });
  }, []);

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

  const goToCreate = () => {
    navigate("/create");
  };

  const goToManage = () => {
    navigate("/manage");
  };

  return (
    <>
      <PageHeader
        title="Productions"
        loading={showRefreshing}
        titleAdornment={
          <InfoTooltip>
            A <strong>production</strong> is a named group of communication
            lines
          </InfoTooltip>
        }
      >
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
      {!!orderedProductions.length && (
        <ProductionsList
          productions={orderedProductions}
          error={error}
          onReorder={handleReorder}
        />
      )}
      <PresetList productions={orderedProductions} />
    </>
  );
};
