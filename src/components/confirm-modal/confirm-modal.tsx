import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { Modal } from "../modal/modal";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { VerifyDecision } from "../verify-decision/verify-decision";

export const ConfirmModal = ({
  firstString,
  secondString,
  onClose,
  confirm,
  abort,
}: {
  firstString: string;
  secondString: string;
  onClose: () => void;
  confirm: () => void;
  abort: () => void;
}) => {
  return (
    <Modal onClose={onClose}>
      <DisplayContainerHeader>Confirm</DisplayContainerHeader>
      <ModalConfirmationText>{firstString}</ModalConfirmationText>
      <ModalConfirmationText className="bold">
        {secondString}
      </ModalConfirmationText>
      <VerifyDecision confirm={confirm} abort={abort} />
    </Modal>
  );
};
