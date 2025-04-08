import styled from "@emotion/styled";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";

export const NameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
`;

export const ProductionName = styled.p`
  margin-bottom: 1rem;

  &.name {
    font-weight: bold;
    min-height: 1.5rem;
    margin: 0 0 0 0.5rem;
  }
`;

export const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 0 0 2rem;
  border-radius: 0.5rem;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 3rem;
  margin-top: 1rem;
`;

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

export const HeaderText = styled.div`
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
`;

export const HeaderExitButton = styled.div`
  &:hover {
    cursor: pointer;
  }

  svg {
    fill: #f96c6c;
    width: 3rem;
    height: 3rem;
  }
`;
