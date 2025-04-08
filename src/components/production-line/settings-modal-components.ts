import styled from "@emotion/styled";
import { ActionButton } from "../landing-page/form-elements";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background: #383838;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 80%;
  max-width: 40rem;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.2);
  color: white;
`;

export const ModalHeader = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 600;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
  font-size: 1.6rem;
`;

export const CancelButton = styled(ActionButton)`
  background: #d6d3d1;

  &:disabled {
    background: rgba(214, 211, 209, 0.8);
  }
`;

export const ButtonDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 3rem;
`;
