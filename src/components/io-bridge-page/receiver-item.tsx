import { useEffect, useState } from "react";
import { TSavedReceiver, TBridgeState } from "../../api/api";
import { CollapsibleItem } from "../shared/collapsible-item";
import { ReceiverExpandedContent } from "./receiver-expanded-content";
import { useDeleteReceiver } from "../../hooks/use-delete-receiver";
import {
  BoldText,
  StatusIndicator,
  StatusWrapper,
} from "./io-bridge-components";

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
      <BoldText>{receiver.label ?? "Receiver"}</BoldText>
      <StatusWrapper>
        <BoldText>Status: {receiver.status as TBridgeState}</BoldText>
        <StatusIndicator
          bgColor={renderStatusIndicator(receiver.status as TBridgeState)}
        />
      </StatusWrapper>
    </>
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
