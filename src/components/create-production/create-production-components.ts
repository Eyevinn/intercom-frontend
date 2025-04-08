import styled from "@emotion/styled";
import { darkText, errorColour } from "../../css-helpers/defaults";
import { FlexContainer } from "../generic-components";

export const HeaderWrapper = styled.div`
  display: flex;
  margin-bottom: 2rem;
  align-items: center;
  h2 {
    margin: 0;
    margin-left: 1rem;
  }
`;

export const ButtonWrapper = styled.div`
  margin: 0 1rem 1rem 0;
  :last-of-type {
    margin: 0 0 1rem;
  }
`;

export const ProductionConfirmation = styled.div`
  background: #91fa8c;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b2ffa1;
  color: #1a1a1a;
`;

export const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 1rem 0;
`;

export const CheckboxWrapper = styled.div`
  margin-bottom: 3rem;
`;

export const ButtonContainer = styled(FlexContainer)`
  gap: 1rem;
`;
