import styled from "@emotion/styled";
import { CopyIcon, CheckIcon } from "../../assets/icons/icon";
import { useCopyLinks } from "./use-copy-links";

const IconWrapper = styled.div<{
  isCopied: boolean;
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

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }

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
`;

export const CopyButton = ({
  url,
  className,
}: {
  url: string;
  className: string;
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  const handleCopy = () => {
    if (isCopied) return;

    handleCopyUrlToClipboard(url);
  };

  return (
    <IconWrapper
      title="Copy URL"
      isCopied={isCopied}
      onClick={handleCopy}
      className={className}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </IconWrapper>
  );
};
