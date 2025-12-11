import { useEffect, useRef, useState, useCallback } from "react";
import { generateWhipUrl } from "../../../utils/generateWhipUrl";
import { CopyButton } from "../../copy-button/copy-button";
import { DecorativeLabel } from "../../form-elements/form-elements";
import { Modal } from "../../modal/modal";
import { RefreshButton } from "../../refresh-button/refresh-button";
import {
  CombinedInputWrapper,
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

  const generateUrl = useCallback(() => {
    if (username.trim()) {
      const url = generateWhipUrl(productionId, lineId, username.trim());
      setWhipUrl(url);
    } else {
      setWhipUrl("");
    }
  }, [username, productionId, lineId]);

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
  }, [generateUrl]);

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
              <DecorativeLabel>WHIP URL</DecorativeLabel>
              <CombinedInputWrapper>
                <span>{generateWhipUrl(productionId, lineId, "")}</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
              </CombinedInputWrapper>
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
