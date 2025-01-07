import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { BackArrow } from "../../assets/icons/icon";

const StyledBackBtn = styled.div`
  cursor: pointer;
  color: #59cbe8;
  background: transparent;
  padding: 0;
  margin: 0;
  width: 4rem;
  height: 4rem;
`;

export const NavigateToRootButton = ({
  resetOnExitRequest,
}: {
  resetOnExitRequest?: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <StyledBackBtn
      onClick={() => {
        if (resetOnExitRequest) {
          resetOnExitRequest();
        } else {
          navigate("/");
        }
      }}
    >
      <BackArrow />
    </StyledBackBtn>
  );
};
