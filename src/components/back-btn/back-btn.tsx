import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { BackArrow } from "../../assets/icons/icon";

const StyledBackBtn = styled.button`
  cursor: pointer;
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
