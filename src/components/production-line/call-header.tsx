import {
  UsersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TVIcon,
} from "../../assets/icons/icon";
import {
  HeaderTexts,
  ProductionName,
  ParticipantCount,
  HeaderIcon,
  Id,
} from "../production-list/production-list-components";
import { AudioFeedIcon, CallHeader } from "./production-line-components";
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
        open={open}
        className={(line?.participants.length || 0) > 0 ? "active" : ""}
      >
        {!open && line?.programOutputLine && (
          <AudioFeedIcon open={false}>
            <TVIcon />
          </AudioFeedIcon>
        )}
        <ProductionName
          title={`${production?.name} (id: ${production?.productionId}) / ${line?.name}`}
        >
          {`${truncatedProductionName}`}
          <Id>{`(id: ${production?.productionId})`}</Id>
          {`/ ${truncatedLineName}`}
        </ProductionName>
        <UsersIcon />
        <ParticipantCount>{line?.participants.length}</ParticipantCount>
      </HeaderTexts>
      {line?.programOutputLine && open && (
        <AudioFeedIcon open>
          <TVIcon />
          Audio feed
        </AudioFeedIcon>
      )}
      <HeaderIcon>{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</HeaderIcon>
    </CallHeader>
  );
};
