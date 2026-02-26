import { TBasicProductionResponse } from "../../api/api";
import {
  ProductionName,
  ProductionNameWrapper,
} from "./production-list-components";

export const HeaderText = ({
  production,
}: {
  production: TBasicProductionResponse;
}) => {
  return (
    <ProductionNameWrapper>
      <ProductionName title={production.name}>
        {production.name.length > 40
          ? `${production.name.slice(0, 40)}...`
          : production.name}
      </ProductionName>
    </ProductionNameWrapper>
  );
};
