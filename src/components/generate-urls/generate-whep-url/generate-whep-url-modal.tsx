import { useEffect, useRef, useState } from "react";
import { generateWhepUrl } from "../../../utils/generateWhepUrl";
import { CopyButton } from "../../copy-button/copy-button";
import { DecorativeLabel, FormInput } from "../../form-elements/form-elements";
import { Modal } from "../../modal/modal";
import { RefreshButton } from "../../refresh-button/refresh-button";
import {
  InputWrapper,
  LinkLabel,
  ModalHeader,
  ModalNoteWrapper,
  ModalText,
  ModalTextBold,
  ModalTextItalic,
  Wrapper,
} from "../generate-urls-components";

type TGenerateWhepUrlModalProps = {
  productionId: string;
  lineId: string;
  onClose: () => void;
};

export const GenerateWhepUrlModal = ({
  productionId,
  lineId,
  onClose,
}: TGenerateWhepUrlModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [whepUrl, setWhepUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateUrl = () => {
    if (username.trim()) {
      const url = generateWhepUrl(productionId, lineId, username.trim());
      setWhepUrl(url);
    } else {
      setWhepUrl("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    generateUrl();
  }, [username]);

  const handleRefresh = () => {
    setIsLoading(true);
    generateUrl();
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Modal onClose={onClose}>
      <div ref={modalRef}>
        <ModalHeader>Generate WHEP URL</ModalHeader>
        <ModalText>
          Enter a username to generate a WHEP URL for connecting to the server.
        </ModalText>
        <ModalNoteWrapper>
          <ModalTextBold>Note:</ModalTextBold>
          <ModalTextItalic>
            This URL is tied to the username and will update if you refresh.
          </ModalTextItalic>
        </ModalNoteWrapper>

        <Wrapper>
          <InputWrapper>
            <LinkLabel>
              <DecorativeLabel>Username</DecorativeLabel>
              <FormInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </LinkLabel>
          </InputWrapper>

          <InputWrapper>
            <LinkLabel>
              <DecorativeLabel>WHEP URL</DecorativeLabel>
              <FormInput
                readOnly
                value={
                  isLoading
                    ? "Loading..."
                    : whepUrl || "Enter a username to generate the URL"
                }
              />
            </LinkLabel>
            <CopyButton
              urls={[whepUrl]}
              className="share-line-link-modal"
              disabled={!whepUrl}
            />
          </InputWrapper>
        </Wrapper>

        <RefreshButton
          label="Refresh URL"
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>
    </Modal>
  );
};
