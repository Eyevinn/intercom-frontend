import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { Modal } from "../modal/modal";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { VerifyDecision } from "../verify-decision/verify-decision";

type ExitConfirmationModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ExitConfirmationModal = ({
  isOpen,
  onConfirm,
  onClose,
}: ExitConfirmationModalProps) => {
  return (
    isOpen && (
      <Modal onClose={onClose}>
        <DisplayContainerHeader>Confirm</DisplayContainerHeader>
        <ModalConfirmationText>
          Are you sure you want to leave all calls?
        </ModalConfirmationText>
        <VerifyDecision confirm={onConfirm} abort={onClose} />
      </Modal>
    )
  );
};
