import { FC } from "react";
import { Modal } from "../modal/modal";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { VerifyDecision } from "./verify-decision";

interface ConfirmationModalProps {
  title: string;
  description: string;
  confirmationText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = (props) => {
  const { title, description, confirmationText, onCancel, onConfirm } = props;

  return (
    <Modal onClose={onCancel}>
      <DisplayContainerHeader>{title}</DisplayContainerHeader>
      <ModalConfirmationText>{description}</ModalConfirmationText>
      {confirmationText && (
        <ModalConfirmationText className="bold">
          {confirmationText}
        </ModalConfirmationText>
      )}
      <VerifyDecision confirm={onConfirm} abort={onCancel} />
    </Modal>
  );
};
