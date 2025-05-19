import { useEffect, useRef, useState } from "react";
import { FormInput } from "../landing-page/form-elements";
import { Modal } from "../modal/modal";
import { CopyButton } from "../copy-button/copy-button";
import { RefreshButton } from "../refresh-button/refresh-button";
import {
  ModalHeader,
  ModalText,
  ModalNoteWrapper,
  ModalTextBold,
  ModalTextItalic,
  Wrapper,
  InputWrapper,
} from "./share-line-components";

type TShareLineLinkModalProps = {
  urls: string[];
  isCopyProduction?: boolean;
  onRefresh: () => void;
  onClose: () => void;
};

export const ShareLineLinkModal = ({
  urls,
  isCopyProduction = false,
  onRefresh,
  onClose,
}: TShareLineLinkModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRefresh = async () => {
    setIsLoading(true);
    onRefresh();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Modal onClose={onClose}>
      <div ref={modalRef}>
        <ModalHeader>
          Share {isCopyProduction ? "Production URLs" : "Line URL"}
        </ModalHeader>
        <ModalText>
          Share {isCopyProduction ? "these production links" : "this line link"}{" "}
          with someone you wish to join your{" "}
          {isCopyProduction ? "production" : "line"}.
        </ModalText>
        <ModalNoteWrapper>
          <ModalTextBold>Note:</ModalTextBold>
          <ModalTextItalic>Each link can only be used once.</ModalTextItalic>
        </ModalNoteWrapper>
        <ModalTextItalic>
          Refresh the URL to generate a new one.
        </ModalTextItalic>
        <Wrapper>
          <InputWrapper>
            {urls.map((url) => (
              <FormInput
                key={url}
                value={isLoading ? "Loading..." : url}
                readOnly
              />
            ))}
          </InputWrapper>
          <CopyButton urls={urls} className="share-line-link-modal" />
        </Wrapper>
        <RefreshButton
          label={`Refresh URL${urls.length > 1 ? "s" : ""}`}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>
    </Modal>
  );
};
