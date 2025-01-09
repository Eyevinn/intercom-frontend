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
  margin-bottom: 1rem;
  margin-top: 1rem;
`;

type ProgramOutputModalProps = {
  onClose: () => void;
  onJoin: () => void;
  setIsProgramUser: (value: boolean) => void;
};

export const ProgramOutputModal = ({
  onClose,
  onJoin,
  setIsProgramUser,
}: ProgramOutputModalProps) => {
  return (
    <Modal onClose={onClose}>
      <ContentWrapper>
        <p>
          This is a line for program output. Do you wish to join the line as a
          as the program output?
        </p>
        <CheckboxWrapper>
          <Checkbox
            label="Join as program output"
            onChange={(e) => setIsProgramUser(e.target.checked)}
          />
        </CheckboxWrapper>
      </ContentWrapper>
      <ButtonWrapper>
        <PrimaryButton onClick={onJoin}>Join</PrimaryButton>
      </ButtonWrapper>
    </Modal>
  );
};
