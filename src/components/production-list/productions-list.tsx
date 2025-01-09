import styled from "@emotion/styled";
import { LocalError } from "../error.tsx";
import { ProductionsListItem } from "./production-list-item.tsx";
import { TBasicProductionResponse } from "../../api/api.ts";

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0 0 2rem;
  align-items: flex-start;
`;

type TProductionsList = {
  productions: TBasicProductionResponse[];
  error: Error | null;
  managementMode?: boolean;
};

export const ProductionsList = ({
  productions,
  error,
  managementMode = false,
}: TProductionsList) => {
  return (
    <ListWrapper>
      {error && <LocalError error={error} />}
      {!error &&
        productions &&
        productions.map((p) => (
          <ProductionsListItem
            key={p.productionId}
            production={p}
            managementMode={managementMode}
          />
        ))}
    </ListWrapper>
  );
};
