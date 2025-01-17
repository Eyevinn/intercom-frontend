import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { Modal } from "../modal/modal";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { VerifyDecision } from "../verify-decision/verify-decision";

export const MuteRemoteParticipantModal = ({
  userName,
  muteError,
  onClose,
  confirm,
  abort,
}: {
  userName: string;
  muteError: boolean;
  onClose: () => void;
  confirm: () => void;
  abort: () => void;
}) => {
  return (
    <Modal onClose={onClose}>
      <DisplayContainerHeader>Confirm</DisplayContainerHeader>
      <ModalConfirmationText>
        {muteError
          ? "Something went wrong, Please try again"
          : `Are you sure you want to mute ${userName}?`}
      </ModalConfirmationText>
      <ModalConfirmationText className="bold">
        {muteError
          ? ""
          : `This will mute ${userName} for everyone in the call.`}
      </ModalConfirmationText>
      <VerifyDecision confirm={confirm} abort={abort} />
    </Modal>
  );
};
