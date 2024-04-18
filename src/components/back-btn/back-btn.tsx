import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { BackArrow } from "../../assets/icons/icon";
import { ActionButton } from "../landing-page/form-elements";

const StyledBackBtn = styled(ActionButton)`
  padding: 0;
  margin: 0;
  background: transparent;
  border: transparent;
`;

export const BackBtn = () => {
  const navigate = useNavigate();

  return (
    <StyledBackBtn type="button" onClick={() => navigate("/")}>
      <BackArrow />
    </StyledBackBtn>
  );
};
