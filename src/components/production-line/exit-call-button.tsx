import styled from "@emotion/styled";
import { RemoveIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";

const StyledBackBtn = styled(PrimaryButton)`
  padding: 0;
  margin: 0;
  width: 4rem;
  background: #32383b;
  border: 0.2rem solid #6d6d6d;

  svg {
    fill: #f96c6c;
  }
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
      <RemoveIcon />
    </StyledBackBtn>
  );
};
