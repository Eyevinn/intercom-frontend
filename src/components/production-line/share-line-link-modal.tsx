import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, RefreshIcon } from "../../assets/icons/icon";
import { FormInput } from "../landing-page/form-elements";
import { Modal } from "../modal/modal";
import { StyledRefreshBtn } from "../reload-devices-button.tsx/reload-devices-button";

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

const IconWrapper = styled.div<{ isCopied: boolean }>`
  width: 4rem;
  height: 4rem;
  margin-left: 1rem;
  display: flex;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition:
    transform 0.1s ease,
    background 0.2s ease;

  ${({ isCopied }) =>
    !isCopied &&
    `
    &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.4);
  }
  `}

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  svg {
    fill: #59cbe8;
  }
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
  const [isCopied, setIsCopied] = useState<boolean>(false);
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

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isCopied]);

  const handleCopyUrlToClipboard = (input: string) => {
    if (input !== null) {
      navigator.clipboard
        .writeText(input)
        .then(() => {
          setIsCopied(true);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
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
          <FormInput value={url} readOnly />
          <IconWrapper
            isCopied={isCopied}
            onClick={() => {
              if (isCopied) return;
              handleCopyUrlToClipboard(url);
            }}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </IconWrapper>
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
