import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import {
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../form-elements/form-elements";
import { Modal } from "../modal/modal";
import { InfoTooltip } from "../info-tooltip/info-tooltip";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

const HostPortInput = styled(FormInput)`
  padding-left: calc(2rem + 3.5ch);
  margin: 0;
`;

interface ConnectToWsModalProps {
  isOpen: boolean;
  handleConnect: (url: string) => void;
  onClose: () => void;
  initialUrl?: string;
}

export const ConnectToWsModal = ({
  isOpen,
  handleConnect,
  onClose,
  initialUrl,
}: ConnectToWsModalProps) => {
  const PROTOCOL = "ws://";
  const toHostPort = (url: string) => {
    if (url.startsWith("ws://")) return url.slice(5);
    if (url.startsWith("wss://")) return url.slice(6);
    return url;
  };
  const [hostPort, setHostPort] = useState<string>(
    initialUrl ? toHostPort(initialUrl) : ""
  );

  useEffect(() => {
    if (isOpen && initialUrl) {
      setHostPort(toHostPort(initialUrl));
    }
  }, [isOpen, initialUrl]);

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

  const isValidHostPort = (input: string): boolean => {
    const pattern = /^([a-zA-Z0-9.-]+|\[[\da-fA-F:]+\])(:\d{1,5})?$/;
    return pattern.test(input);
  };

  const submit = () => {
    if (hostPort && isValidHostPort(hostPort)) {
      handleConnect(`${PROTOCOL}${hostPort}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Connect to Companion WebSocket"
      titleExtra={
        <InfoTooltip>
          <a
            href="https://docs.osaas.io/osaas.wiki/User-Guide%3A-Cloud-Intercom.html#controlling-your-calls-with-an-elgato-stream-deck-using-companion"
            target="_blank"
            rel="noopener noreferrer"
          >
            View user guide
          </a>
        </InfoTooltip>
      }
    >
      <ModalText>
        To connect to the WebSocket server, please enter it&apos;s address:
      </ModalText>
      <InputGroup>
        <Prefix aria-hidden="true">{PROTOCOL}</Prefix>
        <HostPortInput
          aria-label="WebSocket host and port"
          type="text"
          placeholder="localhost:12345"
          value={hostPort}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </InputGroup>
      <ButtonWrapper>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={submit}
          disabled={!hostPort || !isValidHostPort(hostPort)}
        >
          Connect
        </PrimaryButton>
      </ButtonWrapper>
    </Modal>
  );
};
