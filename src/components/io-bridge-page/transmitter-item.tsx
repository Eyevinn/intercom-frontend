import { useEffect, useState } from "react";
import { TSavedTransmitter, TBridgeState } from "../../api/api";
import { CollapsibleItem } from "../shared/collapsible-item";
import { ExpandedContent } from "./transmitter-expanded-content";
import { useDeleteTransmitter } from "../../hooks/use-delete-transmitter";
import {
  BoldText,
  StatusIndicator,
  StatusWrapper,
} from "./io-bridge-components";

type TransmitterItemProps = {
  transmitter: TSavedTransmitter;
  refresh: () => void;
};

export const TransmitterItem = ({
  transmitter,
  refresh,
}: TransmitterItemProps) => {
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);
  const [removeTransmitterId, setRemoveTransmitterId] = useState<string | null>(
    null
  );

  const {
    loading: deleteTransmitterLoading,
    success: successfulDeleteTransmitter,
  } = useDeleteTransmitter(removeTransmitterId);

  useEffect(() => {
    if (successfulDeleteTransmitter) {
      setRemoveTransmitterId(null);
      setDisplayConfirmationModal(false);
      refresh();
    }
  }, [successfulDeleteTransmitter, refresh]);

  const renderStatusIndicator = (status: TBridgeState) => {
    switch (status) {
      case "running":
        return "#22c55e";
      case "idle":
        return "#22c55e";
      case "stopped":
        return "#ebca6a";
      case "failed":
        return "#f96c6c";
      default:
        return "#59cbe8";
    }
  };

  const headerContent = (
    <>
      <BoldText>{transmitter.label ?? "Label"}</BoldText>
      <StatusWrapper>
        <BoldText>Status: {transmitter.status as TBridgeState}</BoldText>
        <StatusIndicator
          bgColor={renderStatusIndicator(transmitter.status as TBridgeState)}
        />
      </StatusWrapper>
    </>
  );

  const expandedContent = (
    <ExpandedContent
      transmitter={transmitter}
      displayConfirmationModal={displayConfirmationModal}
      setDisplayConfirmationModal={setDisplayConfirmationModal}
      setRemoveTransmitterId={setRemoveTransmitterId}
      deleteTransmitterLoading={deleteTransmitterLoading}
      refresh={refresh}
    />
  );

  return (
    <CollapsibleItem
      headerContent={headerContent}
      expandedContent={expandedContent}
    />
  );
};
