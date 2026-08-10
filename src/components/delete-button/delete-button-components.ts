import styled from "@emotion/styled";
import { SecondaryButton } from "../form-elements/form-elements";

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1rem 0 1rem 0;
  gap: 2rem;
`;

export const DeleteButton = styled(SecondaryButton)`
  display: flex;
  align-items: center;
  background: #d15c5c;
  color: white;
  font-size: 1.3rem;
  padding: 0.6rem 1.2rem;
  line-height: 1.8rem;

  &:disabled {
    background: #ab5252;
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
    fill: white;
  }
`;

export const SpinnerWrapper = styled.div`
  position: relative;
  width: 2rem;
  height: 2rem;
`;
