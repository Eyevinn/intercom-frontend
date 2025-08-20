import styled from "@emotion/styled";
import { useState } from "react";
import { HelpIcon } from "../../assets/icons/icon";
import { PrimaryButton, SecondaryButton } from "../form-elements/form-elements";
import { Modal } from "../modal/modal";
import { Tooltip } from "../tooltip/tooltip";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 1rem;
  margin-bottom: 1rem;
`;

const ModalHeader = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
`;

const ModalText = styled.p`
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
`;

const Prefix = styled.span`
  position: absolute;
  left: 1.2rem;
  font-size: 1.4rem;
  line-height: 1rem;
  color: #9aa3ab;
  pointer-events: none;
`;

const HostPortInput = styled.input`
  width: 100%;
  padding: 1rem 0.8rem;
  line-height: 1.6rem;
  padding-left: calc(2rem + 3.5ch);
  border-radius: 0.5rem;
  border: 0.1rem solid #6d6d6d;
  background: #2a3136;
  color: #e6edf3;
  font-size: 1.6rem;
  outline: none;

  &::placeholder {
    color: #6b7780;
  }
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
  const [hostPort, setHostPort] = useState<string>("");
  const PROTOCOL = "ws://";

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    let withoutProtocol = v;

    if (v.startsWith("ws://")) {
      withoutProtocol = v.slice(5);
    } else if (v.startsWith("wss://")) {
      withoutProtocol = v.slice(6);
    }

    setHostPort(withoutProtocol);
  };

  const submit = () => handleConnect(`${PROTOCOL}${hostPort}`);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Modal onClose={onClose}>
      <HeaderWrapper>
        <ModalHeader>Connect to Companion WebSocket</ModalHeader>
        <Tooltip tooltipText="View user guide">
          <a
            href="https://docs.osaas.io/osaas.wiki/User-Guide%3A-Cloud-Intercom.html#controlling-your-calls-with-an-elgato-stream-deck-using-companion"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpIcon />
          </a>
        </Tooltip>
      </HeaderWrapper>
      <ModalText>
        To connect to the WebSocket server, please enter it&apos;s address:
      </ModalText>
      <InputGroup>
        <Prefix aria-hidden="true">{PROTOCOL}</Prefix>
        <HostPortInput
          aria-label="WebSocket host and port"
          type="text"
          placeholder="host:port"
          value={hostPort}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </InputGroup>
      <ButtonWrapper>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton onClick={submit} disabled={!hostPort}>
          Connect
        </PrimaryButton>
      </ButtonWrapper>
    </Modal>
  );
};
