import { CheckIcon, CopyIcon } from "../../assets/icons/icon";
import { CopyIconWrapper } from "./copy-components";
import { useCopyLinks } from "./use-copy-links";

export const CopyButton = ({
  urls,
  className,
  disabled,
}: {
  urls: string[];
  className?: string;
  disabled?: boolean;
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  const handleCopy = () => {
    if (isCopied || disabled) return;

    handleCopyUrlToClipboard(urls);
  };

  return (
    <CopyIconWrapper
      title="Copy URL"
      isCopied={isCopied}
      onClick={handleCopy}
      className={className}
      disabled={disabled}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </CopyIconWrapper>
  );
};
