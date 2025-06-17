import { TSavedIngest } from "../../api/api";
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
} from "./ingest-components";

type ExpandedContentProps = {
  ingest: TSavedIngest;
  displayConfirmationModal: boolean;
  deleteIngestLoading: boolean;
  setDisplayConfirmationModal: (displayConfirmationModal: boolean) => void;
  setEditNameOpen: (editNameOpen: boolean) => void;
  setRemoveIngestId: (removeIngestId: string | null) => void;
  refresh: () => void;
};

export const ExpandedContent = ({
  ingest,
  displayConfirmationModal,
  deleteIngestLoading,
  setDisplayConfirmationModal,
  setEditNameOpen,
  setRemoveIngestId,
  refresh,
}: ExpandedContentProps) => {
  const deviceTypes = ["deviceInput", "deviceOutput"];

  // TODO: add disabled state when ingest is in use
  const isDeleteIngestDisabled = false;

  return (
    <>
      <FormItem label="IP address">
        <Text title={ingest.ipAddress} className="ip-address">
          {ingest.ipAddress.length > 40
            ? `${ingest.ipAddress.slice(0, 40)}...`
            : ingest.ipAddress}
        </Text>
      </FormItem>
      <Wrapper>
        {deviceTypes.map((deviceType) => (
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
              {deviceType === "deviceOutput" || deviceType === "deviceInput"
                ? ingest[deviceType].map(
                    (d: { name: string; label: string }) => (
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
                            renderLabel={() => (
                              <span
                                title={d.label}
                                style={{ marginRight: "1rem" }}
                              >
                                {d.label.length > 40
                                  ? `${d.label.slice(0, 40)}...`
                                  : d.label}
                              </span>
                            )}
                            refresh={refresh}
                          />
                        </DeviceTableCell>
                        <DeviceTableCell>
                          <StatusDot isActive />
                        </DeviceTableCell>
                      </DeviceTableRow>
                    )
                  )
                : null}
            </DeviceTable>
          </DeviceSection>
        ))}
      </Wrapper>
      <ButtonsWrapper>
        <DeleteButton
          type="button"
          disabled={isDeleteIngestDisabled}
          onClick={() => setDisplayConfirmationModal(true)}
        >
          Delete Ingest
          {deleteIngestLoading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ButtonsWrapper>
      {displayConfirmationModal && (
        <ConfirmationModal
          title="Delete Ingest"
          description={`You are about to delete the ingest: ${ingest.name}`}
          confirmationText="Are you sure?"
          onCancel={() => setDisplayConfirmationModal(false)}
          onConfirm={() => setRemoveIngestId(ingest._id)}
        />
      )}
    </>
  );
};
