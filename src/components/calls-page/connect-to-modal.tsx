import styled from "@emotion/styled";
import { useState } from "react";
import {
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../landing-page/form-elements";
import { Modal } from "../modal/modal";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const ModalHeader = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 800;
`;

const ModalText = styled.p`
  margin-bottom: 1rem;
`;

interface ConnectToWsModalProps {
  isOpen: boolean;
  handleConnect: (url: string) => void;
  onClose: () => void;
}

export const ConnectToWsModal = ({
  isOpen,
  handleConnect,
  onClose,
}: ConnectToWsModalProps) => {
  const [url, setUrl] = useState<string>("ws://localhost:12345");

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <ModalHeader>Connect to WebSocket</ModalHeader>
      <ModalText>
        To connect to the WebSocket server, please enter the URL:
      </ModalText>
      <FormInput
        type="text"
        placeholder="ws://localhost:12345"
        className="border p-2 rounded"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <ButtonWrapper>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton onClick={() => handleConnect(url)}>
          Connect
        </PrimaryButton>
      </ButtonWrapper>
    </Modal>
  );
};
