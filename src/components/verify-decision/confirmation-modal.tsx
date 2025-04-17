import { FC } from "react";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { Modal } from "../modal/modal";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { VerifyDecision } from "./verify-decision";

interface ConfirmationModalProps {
  title: string;
  description: string;
  confirmationText?: string;
  shouldSubmitOnEnter?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = (props) => {
  const {
    title,
    description,
    confirmationText,
    onCancel,
    onConfirm,
    shouldSubmitOnEnter,
  } = props;

  useSubmitOnEnter({
    shouldSubmitOnEnter,
    submitHandler: onConfirm,
  });

  return (
    <Modal onClose={onCancel}>
      <DisplayContainerHeader>{title}</DisplayContainerHeader>
      <ModalConfirmationText>{description}</ModalConfirmationText>
      {confirmationText && (
        <ModalConfirmationText className="bold">
          {confirmationText}
        </ModalConfirmationText>
      )}
      <VerifyDecision
        confirm={onConfirm}
        abort={onCancel}
        shouldSubmitOnEnter={shouldSubmitOnEnter}
      />
    </Modal>
  );
};
