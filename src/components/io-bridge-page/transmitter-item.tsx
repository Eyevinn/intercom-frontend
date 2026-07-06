import { useEffect, useState } from "react";
import { TSavedTransmitter, TBridgeState } from "../../api/api";
import { CollapsibleItem } from "../shared/collapsible-item";
import { ExpandedContent } from "./transmitter-expanded-content";
import { BoldText, HeaderContent, StatusPill } from "./io-bridge-components";
import { useDeleteTransmitter } from "../../hooks/use-delete-transmitter";

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

  const getStatusColor = (status: TBridgeState) => {
    switch (status) {
      case "running":
        return "#22c55e";
      case "idle":
        return "#59cbe8";
      case "stopped":
        return "#ebca6a";
      case "failed":
        return "#f96c6c";
      default:
        return "#59cbe8";
    }
  };

  const headerContent = (
    <HeaderContent>
      <BoldText>
        {transmitter.label !== "" ? transmitter.label : transmitter.port}
      </BoldText>
      <StatusPill bgColor={getStatusColor(transmitter.status as TBridgeState)}>
        {transmitter.status.charAt(0).toUpperCase()}
        {transmitter.status.slice(1)}
      </StatusPill>
    </HeaderContent>
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
