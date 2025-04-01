import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import { RefreshIcon } from "../../assets/icons/icon";
import { FormInput } from "../landing-page/form-elements";
import { Modal } from "../modal/modal";
import { StyledRefreshBtn } from "../reload-devices-button.tsx/reload-devices-button";
import { CopyButton } from "../copy-button/copy-button";

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

const RefreshButtonWrapper = styled.div`
  display: flex;
  justify-self: flex-end;
`;

export const ShareLineLinkModal = ({
  url,
  onRefresh,
  onClose,
}: TShareLineLinkModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
          <FormInput value={url} readOnly />
          <CopyButton url={url} buttonSize="4rem" marginLeft="1rem" />
        </Wrapper>
        <RefreshButtonWrapper>
          <StyledRefreshBtn onClick={onRefresh}>
            <RefreshIcon />
            Refresh URL
          </StyledRefreshBtn>
        </RefreshButtonWrapper>
      </div>
    </Modal>
  );
};
