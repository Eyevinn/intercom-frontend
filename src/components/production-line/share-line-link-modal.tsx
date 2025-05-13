import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { FormInput } from "../landing-page/form-elements";
import { Modal } from "../modal/modal";
import { CopyButton } from "../copy-button/copy-button";
import { RefreshButton } from "../refresh-button/refresh-button";

type TShareLineLinkModalProps = {
  url: string;
  onRefresh: () => void;
  onClose: () => void;
};

const Wrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const ModalHeader = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 2rem;
  font-weight: 700;
`;

const ModalText = styled.p`
  font-size: 1.6rem;
  display: flex;
  flex-direction: row;
`;

const ModalTextItalic = styled.p`
  font-size: 1.4rem;
  font-style: italic;
`;

const ModalTextBold = styled.p`
  font-size: 1.4rem;
  font-weight: 700;
  margin-right: 0.5rem;
  font-style: italic;
`;

const ModalNoteWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2rem;
`;

export const ShareLineLinkModal = ({
  url,
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
        <ModalHeader>Share Line URL</ModalHeader>
        <ModalText>
          Share this link with someone you wish to join your line.
        </ModalText>
        <ModalNoteWrapper>
          <ModalTextBold>Note:</ModalTextBold>
          <ModalTextItalic>Each link can only be used once.</ModalTextItalic>
        </ModalNoteWrapper>
        <ModalTextItalic>
          Refresh the URL to generate a new one.
        </ModalTextItalic>
        <Wrapper>
          <FormInput value={isLoading ? "Loading..." : url} readOnly />
          <CopyButton url={url} className="share-line-link-modal" />
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
