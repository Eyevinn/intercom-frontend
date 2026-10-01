import styled from "@emotion/styled";
import { SecondaryButton } from "../form-elements/form-elements";

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1rem 0 1rem 0;
`;

export const DeleteButton = styled(SecondaryButton)`
  display: flex;
  align-items: center;
  background: #d15c5c;
  color: white;

  &:disabled {
    background: #ab5252;
  }
`;

export const SpinnerWrapper = styled.div`
  position: relative;
  width: 2rem;
  height: 2rem;
`;

export const DeleteButtonWrapper = styled.span`
  display: inline-flex;
`;

export const DeleteDisabledInfo = styled.p`
  margin: 0 0 1rem 0;
  text-align: right;
  font-size: 1.3rem;
  color: #f96c6c;
`;
