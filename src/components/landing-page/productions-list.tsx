import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { API } from "../../api/api.ts";
import { TProduction } from "../production-line/types.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { LoaderDots } from "../loader/loader.tsx";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  padding: 2rem 0 2rem 2rem;
  flex-wrap: wrap;
  flex-direction: column;
`;

const ProductionListContainer = styled.div`
  position: absolute;
  top: 2rem;
  display: flex;
  padding: 2rem 0 2rem 2rem;
  flex-wrap: wrap;
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
  const [productions, setProductions] = useState<TProduction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [intervalLoad, setIntervalLoad] = useState<boolean>(false);
  const [{ reloadProductionList }, dispatch] = useGlobalState();

  // TODO extract to separate hook file
  useEffect(() => {
    let aborted = false;

    if (reloadProductionList || intervalLoad) {
      setIntervalLoad(false);
      API.listProductions()
        .then((result) => {
          if (aborted) return;

          setProductions(
            result
              // pick laste 10 items
              .slice(-10)
              // display in reverse order
              .toReversed()
              // convert to local format
              .map((prod) => {
                return {
                  name: prod.name,
                  id: parseInt(prod.productionid, 10),
                  lines: prod.lines.map((l) => ({
                    name: l.name,
                    id: parseInt(l.id, 10),
                    connected: false,
                    connectionId: "1",
                    participants: [],
                  })),
                };
              })
          );
          dispatch({
            type: "PRODUCTION_LIST_FETCHED",
          });
          setLoading(false);
        })
        .catch(() => {
          // TODO handle error/retry
        });
    }

    return () => {
      aborted = true;
    };
  }, [dispatch, reloadProductionList, intervalLoad]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIntervalLoad(true);
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Wrapper>
      {loading && <LoaderDots />}
      <ProductionListContainer>
        {/* // TODO handle so future load-component isn't shown on every update
      // TODO ex className={loading && !intervalLoad ? "active" : "in-active"} */}
        {productions.map((p) => (
          <ProductionItem key={p.id}>
            <ProductionName>{p.name}</ProductionName>
            <ProductionId>{p.id}</ProductionId>
          </ProductionItem>
        ))}
      </ProductionListContainer>
    </Wrapper>
  );
};
