import { useEffect, useRef, useState } from "react";
import { generateWhipUrl } from "../../../utils/generateWhipUrl";
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

type TGenerateWhipUrlModalProps = {
  productionId: string;
  lineId: string;
  onClose: () => void;
};

export const GenerateWhipUrlModal = ({
  productionId,
  lineId,
  onClose,
}: TGenerateWhipUrlModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [whipUrl, setWhipUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateUrl = () => {
    if (username.trim()) {
      const url = generateWhipUrl(productionId, lineId, username.trim());
      setWhipUrl(url);
    } else {
      setWhipUrl("");
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
        <ModalHeader>Generate WHIP URL</ModalHeader>
        <ModalText>
          Enter a username to generate a WHIP URL for connecting to the server.
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
              <DecorativeLabel>WHIP URL</DecorativeLabel>
              <FormInput
                readOnly
                value={
                  isLoading
                    ? "Loading..."
                    : whipUrl || "Enter a username to generate the URL"
                }
              />
            </LinkLabel>
            <CopyButton
              urls={[whipUrl]}
              className="share-line-link-modal"
              disabled={!whipUrl}
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
