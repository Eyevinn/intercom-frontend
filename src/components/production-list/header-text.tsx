import { TLine } from "../production-line/types";
import { TBasicProductionResponse } from "../../api/api";
import { CopyLink } from "./copy-link";
import {
  ProductionName,
  ProductionNameWrapper,
} from "./production-list-components";

export const HeaderText = ({
  production,
  line,
  managementMode,
}: {
  production: TBasicProductionResponse;
  line: TLine;
  managementMode: boolean;
}) => {
  return (
    <ProductionNameWrapper>
      <ProductionName title={production.name}>
        {production.name.length > 40
          ? `${production.name.slice(0, 40)}...`
          : production.name}
      </ProductionName>
      {!managementMode && (
        <CopyLink production={production} line={line} isCopyProduction />
      )}
    </ProductionNameWrapper>
  );
};
