import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { BackArrow } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";

const StyledBackBtn = styled(PrimaryButton)`
  padding: 0;
  margin: 0;
  width: 4rem;
`;

export const NavigateToRootButton = ({
  resetOnExit,
}: {
  resetOnExit?: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <StyledBackBtn
      type="button"
      onClick={() => {
        if (resetOnExit) {
          resetOnExit();
        } else {
          navigate("/");
        }
      }}
    >
      <BackArrow />
    </StyledBackBtn>
  );
};
