import styled from "@emotion/styled";
import { LogoutIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";

const StyledBackBtn = styled(PrimaryButton)`
  margin-top: 1rem;
  background: rgba(50, 56, 59, 1);
  color: white;
  border: 0.2rem solid #6d6d6d;
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

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
