import styled from "@emotion/styled";
import { useState } from "react";
import {
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../form-elements/form-elements";
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
  const [url, setUrl] = useState<string>("");

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConnect(url);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader>Connect to WebSocket</ModalHeader>
      <ModalText>
        To connect to the WebSocket server, please enter it&apos;s URL:
      </ModalText>
      <FormInput
        type="text"
        placeholder="ws://host:port"
        className="border p-2 rounded"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
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
