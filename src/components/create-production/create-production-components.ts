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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const ButtonContainer = styled(FlexContainer)`
  gap: 1rem;
`;

export const LineCard = styled.div`
  border: 0.2rem solid #6d6d6d;
  border-radius: 1rem;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  margin-bottom: 1rem;
  background: rgba(50, 56, 59, 0.3);
`;

export const LineCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const LineNumber = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05rem;
`;

export const LineInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  > *:first-child {
    flex: 1;
    min-width: 0;
  }
`;

export const TooltipWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #32383b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.4rem;
    font-size: 1.2rem;
    white-space: nowrap;
    border: 0.1rem solid #6d6d6d;
    z-index: 10;
    margin-bottom: 0.4rem;
  }
`;

export const CreateButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
`;

export const AddLineCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1.5rem;
  border: 0.2rem dashed #6d6d6d;
  border-radius: 1rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: rgba(89, 203, 232, 0.6);
    color: rgba(89, 203, 232, 0.8);
    background: rgba(89, 203, 232, 0.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
    fill: currentColor;
  }
`;
