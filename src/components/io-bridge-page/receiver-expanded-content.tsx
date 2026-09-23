import { TBridgeState, TSavedReceiver } from "../../api/api";
import { useToggleReceiver } from "../../hooks/use-edit-receiver";
import { useUpdateReceiver } from "../../hooks/use-update-receiver";
import { IOBridgeExpandedContent } from "./io-bridge-expanded-content";

type ReceiverExpandedContentProps = {
  receiver: TSavedReceiver;
  displayConfirmationModal: boolean;
  deleteReceiverLoading: boolean;
  setDisplayConfirmationModal: (displayConfirmationModal: boolean) => void;
  setRemoveReceiverId: (receiverId: string | null) => void;
  refresh?: () => void;
};

export const ReceiverExpandedContent = ({
  receiver,
  displayConfirmationModal,
  deleteReceiverLoading,
  setDisplayConfirmationModal,
  setRemoveReceiverId,
  refresh,
}: ReceiverExpandedContentProps) => {
  // eslint-disable-next-line no-underscore-dangle
  const { toggle, loading: toggleLoading } = useToggleReceiver(receiver._id);
  const { updateReceiver } = useUpdateReceiver();

  return (
    <IOBridgeExpandedContent
      item={receiver}
      typeName="Receiver"
      urlConfig={{
        label: "WHEP Username:",
        url: receiver.whepUrl,
        copyLabel: "Copy WHEP URL",
      }}
      onToggle={() => toggle(receiver.status as TBridgeState)}
      toggleLoading={toggleLoading}
      onUpdate={updateReceiver}
      deleteLoading={deleteReceiverLoading}
      displayConfirmationModal={displayConfirmationModal}
      setDisplayConfirmationModal={setDisplayConfirmationModal}
      setRemoveItemId={setRemoveReceiverId}
      refresh={refresh}
    />
  );
};
