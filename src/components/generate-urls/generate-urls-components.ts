import styled from "@emotion/styled";
import { FormLabel } from "../form-elements/form-elements";

export const Wrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

export const ModalHeader = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 2rem;
  font-weight: 700;
`;

export const ModalText = styled.p`
  font-size: 1.6rem;
  display: flex;
  flex-direction: row;
`;

export const ModalTextItalic = styled.p`
  font-size: 1.4rem;
  font-style: italic;
`;

export const ModalTextBold = styled.p`
  font-size: 1.4rem;
  font-weight: 700;
  margin-right: 0.5rem;
  font-style: italic;
`;

export const ModalNoteWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2rem;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;

  input {
    margin-bottom: 0;
  }
`;

export const LinkLabel = styled(FormLabel)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const CombinedInputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 1.6rem;
  padding: 0.75rem;
  margin: 0;
  border: 0.1rem solid #6d6d6d;
  border-radius: 0.5rem;
  background: #32383b;
  color: white;

  &:has(input:focus) {
    border-color: #59cbe8;
    outline: 0.1rem solid #59cbe8;
  }

  span {
    color: #9d9d9d;
    margin-right: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    padding: 0;
    margin: 0;
    color: white;
  }
`;
