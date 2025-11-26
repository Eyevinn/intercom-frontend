import { useEffect, useState } from "react";
import { TIngest } from "../../api/api";
import {
  ButtonsWrapper,
  DeleteButton,
  SpinnerWrapper,
} from "../delete-button/delete-button-components";
import { DecorativeLabel } from "../form-elements/form-elements";
import { Spinner } from "../loader/loader";
import { EditNameForm } from "../shared/edit-name-form";
import { FormItem } from "../user-settings-form/form-item";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import {
  Text,
  Wrapper,
  DeviceSection,
  DeviceTable,
  DeviceTableHeader,
  DeviceTableHeaderCell,
  DeviceTableRow,
  DeviceTableCell,
  StatusDot,
  NoDevices,
} from "./ingest-components";
import { useDeleteActions } from "../shared/use-delete-actions";

type ExpandedContentProps = {
  ingest: TIngest;
  setEditNameOpen: (editNameOpen: boolean) => void;
  refresh: () => void;
};

export const IngestExpandedContent = ({
  ingest,
  setEditNameOpen,
  refresh,
}: ExpandedContentProps) => {
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);

  const { deleteIngest, isDeleting, isSuccess } = useDeleteActions({
    refresh,
  });

  const deviceTypes = ["deviceInput", "deviceOutput"];

  useEffect(() => {
    if (isSuccess) {
      setDisplayConfirmationModal(false);
    }
  }, [isSuccess]);

  // TODO: delete disabled state when ingest is in use
  const isDeleteIngestDisabled = false;

  return (
    <>
      <FormItem label="IP address">
        <Text title={ingest.ipAddress} className="ip-address">
          {ingest.ipAddress && ingest.ipAddress.length > 40
            ? `${ingest.ipAddress.slice(0, 40)}...`
            : ingest.ipAddress}
        </Text>
      </FormItem>
      <Wrapper>
        {deviceTypes.map((deviceType) => {
          const devices =
            deviceType === "deviceOutput" || deviceType === "deviceInput"
              ? ingest[deviceType]
              : [];
          return (
            <DeviceSection key={deviceType}>
              <DecorativeLabel>
                {deviceType === "deviceInput" ? "Input" : "Output"}
              </DecorativeLabel>
              <DeviceTable>
                <DeviceTableHeader>
                  <DeviceTableHeaderCell>Name</DeviceTableHeaderCell>
                  <DeviceTableHeaderCell>Label</DeviceTableHeaderCell>
                  <DeviceTableHeaderCell>Status</DeviceTableHeaderCell>
                </DeviceTableHeader>
                {devices && devices.length === 0 ? (
                  <NoDevices>No devices</NoDevices>
                ) : (
                  devices?.map((d: { name: string; label: string }) => (
                    <DeviceTableRow key={d.name}>
                      <DeviceTableCell title={d.name}>
                        {d.name.length > 40
                          ? `${d.name.slice(0, 40)}...`
                          : d.name}
                      </DeviceTableCell>
                      <DeviceTableCell>
                        <EditNameForm
                          item={{ ...ingest, currentDeviceLabel: d.label }}
                          formSubmitType="currentDeviceLabel"
                          managementMode
                          className="device-label"
                          setEditNameOpen={setEditNameOpen}
                          deviceType={
                            deviceType === "deviceInput" ? "input" : "output"
                          }
                          renderLabel={(item) => {
                            const deviceInputLabel = item.deviceInput?.find(
                              (singleDevice) => singleDevice.name === d.name
                            );
                            const deviceOutputLabel = item.deviceOutput?.find(
                              (singleDevice) => singleDevice.name === d.name
                            );
                            const deviceLabel =
                              deviceType === "deviceInput"
                                ? deviceInputLabel?.label
                                : deviceOutputLabel?.label;
                            return (
                              <span
                                title={deviceLabel}
                                style={{ marginRight: "1rem" }}
                              >
                                {deviceLabel && deviceLabel?.length > 40
                                  ? `${deviceLabel.slice(0, 40)}...`
                                  : deviceLabel}
                              </span>
                            );
                          }}
                          refresh={refresh}
                        />
                      </DeviceTableCell>
                      <DeviceTableCell>
                        <StatusDot isActive />
                      </DeviceTableCell>
                    </DeviceTableRow>
                  ))
                )}
              </DeviceTable>
            </DeviceSection>
          );
        })}
      </Wrapper>
      <ButtonsWrapper>
        <DeleteButton
          type="button"
          disabled={isDeleteIngestDisabled}
          onClick={() => setDisplayConfirmationModal(true)}
        >
          Delete Ingest
          {isDeleting && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ButtonsWrapper>
      {displayConfirmationModal && (
        <ConfirmationModal
          title="Delete Ingest"
          description={`You are about to delete the ingest: ${ingest.label}`}
          confirmationText="Are you sure?"
          onCancel={() => setDisplayConfirmationModal(false)}
          onConfirm={() => deleteIngest(ingest._id)}
        />
      )}
    </>
  );
};
