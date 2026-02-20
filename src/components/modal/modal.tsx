import styled from "@emotion/styled";
import { RemoveIcon } from "../../assets/icons/icon";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #3d3d3d;
  padding: 2rem;
  border-radius: 0.8rem;
  border: solid 0.1rem #868686;
  box-shadow: 0 0.2rem 2rem rgba(123, 123, 123, 0.1);
  width: fit-content;
  max-width: 90%;
  animation: slideIn 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 2.5rem;
    fill: #f96c6c;
  }

  &:hover svg {
    fill: #c44c4c;
  }
`;

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ onClose, children }: ModalProps) => {
  return (
    <ModalWrapper>
      <ModalContent>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <RemoveIcon />
          </CloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalWrapper>
  );
};
