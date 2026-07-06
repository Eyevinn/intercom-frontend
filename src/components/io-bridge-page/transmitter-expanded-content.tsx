import { TSavedTransmitter } from "../../api/api";
import { useToggleTransmitter } from "../../hooks/use-edit-transmitter";
import { useUpdateTransmitter } from "../../hooks/use-update-transmitter";
import { IOBridgeExpandedContent } from "./io-bridge-expanded-content";
import { PropKey, PropValue } from "./io-bridge-components";
import { TruncatedValue } from "./io-bridge-props-list";

type ExpandedContentProps = {
  transmitter: TSavedTransmitter;
  displayConfirmationModal: boolean;
  deleteTransmitterLoading: boolean;
  setDisplayConfirmationModal: (displayConfirmationModal: boolean) => void;
  setRemoveTransmitterId: (transmitterId: string | null) => void;
  refresh?: () => void;
};

export const ExpandedContent = ({
  transmitter,
  displayConfirmationModal,
  deleteTransmitterLoading,
  setDisplayConfirmationModal,
  setRemoveTransmitterId,
  refresh,
}: ExpandedContentProps) => {
  // eslint-disable-next-line no-underscore-dangle
  const { toggle, loading: toggleLoading } = useToggleTransmitter(transmitter._id);
  const { updateTransmitter } = useUpdateTransmitter();

  const extraRows = (
    <>
      <PropKey>Port:</PropKey>
      <PropValue>{transmitter.port}</PropValue>

      <PropKey>Pass-through URL:</PropKey>
      <TruncatedValue text={transmitter.passThroughUrl} />

      <PropKey>Mode:</PropKey>
      <PropValue>{transmitter.mode}</PropValue>

      <PropKey>No Video:</PropKey>
      <PropValue>{transmitter.noVideo ? "true" : "false"}</PropValue>

      <PropKey>Transcode Video to VP8:</PropKey>
      <PropValue>{transmitter.vp8 ? "true" : "false"}</PropValue>

      <PropKey>Bypass Video:</PropKey>
      <PropValue>{transmitter.bypassVideo ? "true" : "false"}</PropValue>
    </>
  );

  return (
    <IOBridgeExpandedContent
      item={transmitter}
      typeName="Transmitter"
      urlConfig={{
        label: "WHIP Username:",
        url: transmitter.whipUrl,
        copyLabel: "Copy WHIP URL",
      }}
      extraRows={extraRows}
      onToggle={toggle}
      toggleLoading={toggleLoading}
      onUpdate={updateTransmitter}
      deleteLoading={deleteTransmitterLoading}
      displayConfirmationModal={displayConfirmationModal}
      setDisplayConfirmationModal={setDisplayConfirmationModal}
      setRemoveItemId={setRemoveTransmitterId}
      refresh={refresh}
    />
  );
};
