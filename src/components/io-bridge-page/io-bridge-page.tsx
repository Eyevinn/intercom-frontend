import { useEffect, useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { PageHeader } from "../page-layout/page-header";
import { PrimaryButton } from "../form-elements/form-elements";
import { LocalError } from "../error";
import { ListWrapper, TransmitterContainer } from "./io-bridge-components";
import { TransmitterItem } from "./transmitter-item";
import { ReceiverItem } from "./receiver-item";
import { AddTransmitterForm } from "./add-transmitter-modal/add-transmitter-form";
import { AddReceiverForm } from "./add-receiver-modal/add-receiver-form";
import { Modal } from "../modal/modal";
import { Tabs } from "../tabs/tabs";
import { useBridgeConfig } from "../../hooks/use-bridge-config";
import { useListReceivers } from "../../hooks/use-receiver-list";
import { useListTransmitters } from "../../hooks/use-transmitter-list";

const IO_TABS = [
  { id: "transmitters", label: "Transmitters" },
  { id: "receivers", label: "Receivers" },
];

export const IOBridgePage = ({ setApiError }: { setApiError: () => void }) => {
  const [showAddTransmitterModal, setShowAddTransmitterModal] = useState(false);
  const [showAddReceiverModal, setShowAddReceiverModal] = useState(false);
  const [activeTab, setActiveTab] = useState("transmitters");
  const [{ apiError }] = useGlobalState();

  const { config, loading: configLoading } = useBridgeConfig();

  // Only fetch transmitters if WHIP gateway is enabled
  const { transmitters, error, setIntervalLoad, refresh } = useListTransmitters(
    config?.whipGatewayEnabled ?? false
  );

  // Only fetch receivers if WHEP gateway is enabled
  const {
    receivers,
    error: receiverError,
    setIntervalLoad: setReceiverIntervalLoad,
    refresh: refreshReceivers,
  } = useListReceivers(config?.whepGatewayEnabled ?? false);

  const list = Array.isArray(transmitters) ? transmitters : [];
  const receiverList = Array.isArray(receivers) ? receivers : [];

  useEffect(() => {
    if (apiError) setApiError();
  }, [apiError, setApiError]);

  // Only poll transmitters if WHIP gateway is enabled
  useEffect(() => {
    if (!config?.whipGatewayEnabled) return undefined;
    const interval = window.setInterval(
      () => setIntervalLoad((prev) => prev + 1),
      1000
    );
    return () => window.clearInterval(interval);
  }, [setIntervalLoad, config?.whipGatewayEnabled]);

  // Only poll receivers if WHEP gateway is enabled
  useEffect(() => {
    if (!config?.whepGatewayEnabled) return undefined;
    const interval = window.setInterval(
      () => setReceiverIntervalLoad((prev) => prev + 1),
      1000
    );
    return () => window.clearInterval(interval);
  }, [setReceiverIntervalLoad, config?.whepGatewayEnabled]);

  // If no gateways are configured, don't show the page
  if (configLoading) {
    return null; // or a loading spinner
  }

  if (!config || (!config.whipGatewayEnabled && !config.whepGatewayEnabled)) {
    return null;
  }

  return (
    <>
      <PageHeader title="Manage I/O Bridges" hasNavigateToRoot>
        <div style={{ display: "flex", gap: "10px" }}>
          {config.whipGatewayEnabled && (
            <PrimaryButton
              type="button"
              onClick={() => setShowAddTransmitterModal(true)}
            >
              Add SRT to WHIP transmitter
            </PrimaryButton>
          )}
          {config.whepGatewayEnabled && (
            <PrimaryButton
              type="button"
              onClick={() => setShowAddReceiverModal(true)}
            >
              Add WHEP to SRT receiver
            </PrimaryButton>
          )}
        </div>
      </PageHeader>

      {error && <LocalError error={error} />}
      {receiverError && <LocalError error={receiverError} />}

      <Tabs tabs={IO_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "transmitters" && config.whipGatewayEnabled && (
        <TransmitterContainer>
          <ListWrapper>
            {list.map((t) => (
              <TransmitterItem
                // eslint-disable-next-line no-underscore-dangle
                key={t._id}
                transmitter={t}
                refresh={refresh}
              />
            ))}
            {list.length === 0 && <p>No transmitters configured</p>}
          </ListWrapper>
        </TransmitterContainer>
      )}

      {activeTab === "receivers" && config.whepGatewayEnabled && (
        <TransmitterContainer>
          <ListWrapper>
            {receiverList.map((r) => (
              <ReceiverItem
                // eslint-disable-next-line no-underscore-dangle
                key={r._id}
                receiver={r}
                refresh={refreshReceivers}
              />
            ))}
            {receiverList.length === 0 && <p>No receivers configured</p>}
          </ListWrapper>
        </TransmitterContainer>
      )}

      {showAddTransmitterModal && (
        <Modal onClose={() => setShowAddTransmitterModal(false)}>
          <AddTransmitterForm
            onSave={async () => {
              setShowAddTransmitterModal(false);
              await refresh();
            }}
          />
        </Modal>
      )}

      {showAddReceiverModal && (
        <Modal onClose={() => setShowAddReceiverModal(false)}>
          <AddReceiverForm
            onSave={async () => {
              setShowAddReceiverModal(false);
              await refreshReceivers();
            }}
          />
        </Modal>
      )}
    </>
  );
};
