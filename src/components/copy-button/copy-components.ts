import styled from "@emotion/styled";

export const CopyToClipboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ButtonWrapper = styled.p`
  display: flex;
  align-items: center;

  &.manage-production-page {
    flex-direction: row-reverse;
  }

  &.create-production-page {
    flex-direction: row;
  }

  svg {
    width: 4rem;
    height: 4rem;
    padding: 1rem 0 1rem 0;
    fill: #76e859;
  }
`;

export const NoteTextItalic = styled.p`
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.4;
`;

export const NoteTextBold = styled.p`
  font-size: 1.4rem;
  font-weight: 700;
  margin-right: 0.5rem;
  font-style: italic;
  line-height: 1.4;
`;

export const NoteWrapper = styled.div`
  display: flex;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

export const CopyIconWrapper = styled.div<{
  isCopied?: boolean;
}>`
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

  &.production-list-item {
    width: 3rem;
    height: 3rem;
    margin-left: 0;
  }

  &.share-line-link-modal {
    width: 4rem;
    height: 4rem;
    margin-left: 1rem;
  }

  svg {
    fill: #59cbe8;
  }

  &:hover svg {
    transform: scale(1.2);
  }
`;
