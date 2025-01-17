import {
  UsersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "../../assets/icons/icon";
import {
  HeaderTexts,
  ProductionName,
  ParticipantCount,
  HeaderIcon,
} from "../production-list/production-list-components";
import { CallHeader } from "./production-line-components";
import { TLine, TProduction } from "./types";

export const CallHeaderComponent = ({
  open,
  line,
  production,
  setOpen,
}: {
  open: boolean;
  line: TLine | null;
  production: TProduction | null;
  setOpen: () => void;
}) => {
  const truncatedProductionName =
    production && production.name.length > 20
      ? `${production.name.slice(0, 20)}...`
      : production?.name;

  const truncatedLineName =
    line && line.name.length > 40 ? `${line.name.slice(0, 40)}...` : line?.name;

  return (
    <CallHeader onClick={setOpen}>
      <HeaderTexts
        className={(line?.participants.length || 0) > 0 ? "active" : ""}
      >
        <ProductionName
          title={`${production?.name} / ${line?.name}`}
        >{`${truncatedProductionName} / ${truncatedLineName}`}</ProductionName>
        <UsersIcon />
        <ParticipantCount>{line?.participants.length}</ParticipantCount>
      </HeaderTexts>
      <HeaderIcon>{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</HeaderIcon>
    </CallHeader>
  );
};
