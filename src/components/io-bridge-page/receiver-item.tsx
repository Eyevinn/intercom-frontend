import { useEffect, useState } from "react";
import { TSavedReceiver, TBridgeState } from "../../api/api";
import { CollapsibleItem } from "../shared/collapsible-item";
import { ReceiverExpandedContent } from "./receiver-expanded-content";
import { BoldText, HeaderContent, StatusPill } from "./io-bridge-components";
import { useDeleteReceiver } from "../../hooks/use-delete-receiver";

type ReceiverItemProps = {
  receiver: TSavedReceiver;
  refresh: () => void;
};

export const ReceiverItem = ({ receiver, refresh }: ReceiverItemProps) => {
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);
  const [removeReceiverId, setRemoveReceiverId] = useState<string | null>(null);

  const { loading: deleteReceiverLoading, success: successfulDeleteReceiver } =
    useDeleteReceiver(removeReceiverId);

  useEffect(() => {
    if (successfulDeleteReceiver) {
      setRemoveReceiverId(null);
      setDisplayConfirmationModal(false);
      refresh();
    }
  }, [successfulDeleteReceiver, refresh]);

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
      <BoldText>{receiver.label !== "" ? receiver.label : "Receiver"}</BoldText>
      <StatusPill bgColor={getStatusColor(receiver.status as TBridgeState)}>
        {receiver.status.charAt(0).toUpperCase()}
        {receiver.status.slice(1)}
      </StatusPill>
    </HeaderContent>
  );

  const expandedContent = (
    <ReceiverExpandedContent
      receiver={receiver}
      displayConfirmationModal={displayConfirmationModal}
      setDisplayConfirmationModal={setDisplayConfirmationModal}
      setRemoveReceiverId={setRemoveReceiverId}
      deleteReceiverLoading={deleteReceiverLoading}
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
