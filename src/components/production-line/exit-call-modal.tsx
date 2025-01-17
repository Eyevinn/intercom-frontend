import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { Modal } from "../modal/modal";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { VerifyDecision } from "../verify-decision/verify-decision";

export const ExitCallModal = ({
  onClose,
  exit,
  abort,
}: {
  onClose: () => void;
  exit: () => void;
  abort: () => void;
}) => {
  return (
    <Modal onClose={onClose}>
      <DisplayContainerHeader>Confirm</DisplayContainerHeader>
      <ModalConfirmationText>
        Are you sure you want to leave the call?
      </ModalConfirmationText>
      <VerifyDecision confirm={exit} abort={abort} />
    </Modal>
  );
};
