import styled from "@emotion/styled";
import { LogoutIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../form-elements/form-elements";

const StyledBackBtn = styled(PrimaryButton)`
  margin-top: 1rem;
  background: transparent;
  color: #f96c6c;
  border: 0.2rem solid rgba(249, 108, 108, 0.5);
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;

  &:hover:not(:disabled) {
    background: rgba(249, 108, 108, 0.1);
  }

  svg {
    width: 2.5rem;
    height: 2.5rem;
    fill: #f96c6c;
  }
`;

const ButtonText = styled.div`
  line-height: 2.4rem;
`;

export const ExitCallButton = ({
  resetOnExit,
}: {
  resetOnExit: () => void;
}) => {
  return (
    <StyledBackBtn
      type="button"
      title="Exit call"
      onClick={() => resetOnExit()}
    >
      <ButtonText>Leave Call</ButtonText>
      <LogoutIcon />
    </StyledBackBtn>
  );
};
