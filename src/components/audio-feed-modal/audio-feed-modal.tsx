import styled from "@emotion/styled";
import { Modal } from "../modal/modal";
import { PrimaryButton } from "../landing-page/form-elements";
import { Checkbox } from "../checkbox/checkbox";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  margin-top: 1rem;
`;

type AudioFeedModalProps = {
  onClose: () => void;
  onJoin: () => void;
  setIsProgramUser: (value: boolean) => void;
  isProgramUser: boolean;
};

export const AudioFeedModal = ({
  onClose,
  onJoin,
  setIsProgramUser,
  isProgramUser,
}: AudioFeedModalProps) => {
  return (
    <Modal onClose={onClose}>
      <ContentWrapper>
        <p>
          This is a line for audio feed. Do you wish to join the line as the
          audio feed or as a listener?
        </p>
        <CheckboxWrapper>
          <Checkbox
            label="Listener"
            checked={!isProgramUser}
            onChange={() => setIsProgramUser(false)}
          />
          <Checkbox
            label="Audio feed"
            checked={isProgramUser}
            onChange={() => setIsProgramUser(true)}
          />
        </CheckboxWrapper>
      </ContentWrapper>
      <ButtonWrapper>
        <PrimaryButton onClick={onJoin}>Join</PrimaryButton>
      </ButtonWrapper>
    </Modal>
  );
};
