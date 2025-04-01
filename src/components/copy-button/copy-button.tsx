import styled from "@emotion/styled";
import { CopyIcon, CheckIcon } from "../../assets/icons/icon";
import { useCopyLinks } from "./use-copy-links";

const IconWrapper = styled.div<{
  isCopied: boolean;
  buttonSize: string;
  marginLeft: string;
}>`
  width: ${({ buttonSize }) => buttonSize};
  height: ${({ buttonSize }) => buttonSize};
  margin-left: ${({ marginLeft }) => marginLeft};
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

export const CopyButton = ({
  url,
  buttonSize,
  marginLeft,
}: {
  url: string;
  buttonSize: string;
  marginLeft: string;
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  return (
    <IconWrapper
      title="Copy URL"
      isCopied={isCopied}
      buttonSize={buttonSize}
      marginLeft={marginLeft}
      onClick={() => {
        if (isCopied) return;
        handleCopyUrlToClipboard(url);
      }}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </IconWrapper>
  );
};
