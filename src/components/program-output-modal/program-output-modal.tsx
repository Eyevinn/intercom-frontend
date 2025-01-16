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

type ProgramOutputModalProps = {
  onClose: () => void;
  onJoin: () => void;
  setIsProgramUser: (value: boolean) => void;
  isProgramUser: boolean;
};

export const ProgramOutputModal = ({
  onClose,
  onJoin,
  setIsProgramUser,
  isProgramUser,
}: ProgramOutputModalProps) => {
  return (
    <Modal onClose={onClose}>
      <ContentWrapper>
        <p>
          This is a line for program output. Do you wish to join the line as a
          as the program output or as a listener?
        </p>
        <CheckboxWrapper>
          <Checkbox
            label="Listener"
            checked={!isProgramUser}
            onChange={() => setIsProgramUser(false)}
          />
          <Checkbox
            label="Program output"
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
