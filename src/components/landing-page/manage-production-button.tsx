import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { SecondaryButton } from "./form-elements";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  padding: 2rem;
`;

export const ManageProductionButton = () => {
  const navigate = useNavigate();

  return (
    <ButtonWrapper>
      <SecondaryButton
        type="button"
        onClick={() => navigate("/manage-productions")}
      >
        Manage Productions
      </SecondaryButton>
    </ButtonWrapper>
  );
};
