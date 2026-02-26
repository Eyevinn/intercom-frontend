import { useEffect, useRef, useState } from "react";
import { generateWhipUrl } from "../../utils/generateWhipUrl";
import { generateWhepUrl } from "../../utils/generateWhepUrl";
import { CopyButton } from "../copy-button/copy-button";
import { DecorativeLabel } from "../form-elements/form-elements";
import { Modal } from "../modal/modal";
import { RefreshButton } from "../refresh-button/refresh-button";
import {
  CombinedInputWrapper,
  InputWrapper,
  LinkLabel,
  ModalNoteWrapper,
  ModalText,
  ModalTextBold,
  ModalTextItalic,
  Wrapper,
} from "./generate-urls-components";

type TGenerateWhipWhepUrlModalProps = {
  productionId: string;
  lineId: string;
  onClose: () => void;
};

export const GenerateWhipWhepUrlModal = ({
  productionId,
  lineId,
  onClose,
}: TGenerateWhipWhepUrlModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [whipUsername, setWhipUsername] = useState("");
  const [whepUsername, setWhepUsername] = useState("");
  const [whipUrl, setWhipUrl] = useState("");
  const [whepUrl, setWhepUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setWhipUrl(
      whipUsername.trim()
        ? generateWhipUrl(productionId, lineId, whipUsername.trim())
        : ""
    );
  }, [whipUsername, productionId, lineId]);

  useEffect(() => {
    setWhepUrl(
      whepUsername.trim()
        ? generateWhepUrl(productionId, lineId, whepUsername.trim())
        : ""
    );
  }, [whepUsername, productionId, lineId]);

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
    return () => {
      if (refreshTimerRef.current !== null)
        clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setWhipUrl(
      whipUsername.trim()
        ? generateWhipUrl(productionId, lineId, whipUsername.trim())
        : ""
    );
    setWhepUrl(
      whepUsername.trim()
        ? generateWhepUrl(productionId, lineId, whepUsername.trim())
        : ""
    );
    refreshTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Modal onClose={onClose} title="Generate WHIP/WHEP URLs">
      <div ref={modalRef}>
        <ModalText>
          Enter a username to generate WHIP and WHEP URLs for connecting to the
          server.
        </ModalText>
        <ModalNoteWrapper>
          <ModalTextBold>Note:</ModalTextBold>
          <ModalTextItalic>
            These URLs are tied to the username and will update if you refresh.
          </ModalTextItalic>
        </ModalNoteWrapper>

        <Wrapper>
          <InputWrapper>
            <LinkLabel>
              <DecorativeLabel>WHIP URL</DecorativeLabel>
              <CombinedInputWrapper>
                <span>{generateWhipUrl(productionId, lineId, "")}</span>
                <input
                  aria-label="WHIP username"
                  value={whipUsername}
                  onChange={(e) => setWhipUsername(e.target.value)}
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

          <InputWrapper>
            <LinkLabel>
              <DecorativeLabel>WHEP URL</DecorativeLabel>
              <CombinedInputWrapper>
                <span>{generateWhepUrl(productionId, lineId, "")}</span>
                <input
                  aria-label="WHEP username"
                  value={whepUsername}
                  onChange={(e) => setWhepUsername(e.target.value)}
                  placeholder="username"
                />
              </CombinedInputWrapper>
            </LinkLabel>
            <CopyButton
              urls={[whepUrl]}
              className="share-line-link-modal"
              disabled={!whepUrl}
            />
          </InputWrapper>
        </Wrapper>

        <RefreshButton
          label="Refresh URLs"
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>
    </Modal>
  );
};
