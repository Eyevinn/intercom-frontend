import styled from "@emotion/styled";
import { FormLabel } from "../landing-page/form-elements";

export const Wrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
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
  align-items: center;
  width: 100%;
`;

export const LinkLabel = styled(FormLabel)`
  width: 100%;
`;
