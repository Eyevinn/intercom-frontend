import styled from "@emotion/styled";
import { TBasicProduction } from "./production-line/types.ts";
import { LocalError } from "./error.tsx";

const ProductionItem = styled.button`
  text-align: start;
  background-color: transparent;
  flex: 1 0 calc(25% - 2rem);
  justify-content: start;
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

type TProductionsList = {
  productions: TBasicProduction[];
  error: Error | null;
  manageProduction?: (v: string) => void;
};

export const ProductionsList = ({
  productions,
  error,
  manageProduction,
}: TProductionsList) => {
  return (
    <>
      {error && <LocalError error={error} />}
      {!error &&
        productions.map((p) => (
          <ProductionItem
            key={p.productionId}
            type="button"
            onClick={() =>
              manageProduction
                ? manageProduction(p.productionId)
                : console.log("")
            }
          >
            <ProductionName>{p.name}</ProductionName>
            <ProductionId>{p.productionId}</ProductionId>
          </ProductionItem>
        ))}
    </>
  );
};
