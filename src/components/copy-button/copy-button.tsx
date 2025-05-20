import { CopyIcon, CheckIcon } from "../../assets/icons/icon";
import { useCopyLinks } from "./use-copy-links";
import { CopyIconWrapper } from "./copy-components";

export const CopyButton = ({
  urls,
  className,
}: {
  urls: string[];
  className: string;
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  const handleCopy = () => {
    if (isCopied) return;

    handleCopyUrlToClipboard(urls);
  };

  return (
    <CopyIconWrapper
      title="Copy URL"
      isCopied={isCopied}
      onClick={handleCopy}
      className={className}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </CopyIconWrapper>
  );
};
