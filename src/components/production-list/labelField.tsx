import { TBasicProductionResponse } from "../../api/api";
import { TLine } from "../production-line/types";
import { HeaderText } from "./header-text";
import { LineBlock } from "./line-block";

export const LabelField = ({
  isLabelProductionName,
  production,
  line,
  managementMode,
}: {
  isLabelProductionName: boolean;
  production: TBasicProductionResponse;
  line: TLine;
  managementMode: boolean;
}) => {
  return isLabelProductionName ? (
    <HeaderText
      production={production}
      line={line}
      managementMode={managementMode}
    />
  ) : (
    <LineBlock managementMode={managementMode} line={line} />
  );
};
