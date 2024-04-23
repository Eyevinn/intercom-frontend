import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { PrimaryButton } from "./form-elements";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  padding: 2rem;
`;

export const ManageProductionButton = () => {
  const navigate = useNavigate();

  return (
    <ButtonWrapper>
      <PrimaryButton
        type="button"
        onClick={() => navigate("/manage-productions")}
      >
        Manage Productions
      </PrimaryButton>
    </ButtonWrapper>
  );
};
