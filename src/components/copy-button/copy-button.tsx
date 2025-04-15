import { CopyIcon, CheckIcon } from "../../assets/icons/icon";
import { useCopyLinks } from "./use-copy-links";
import { CopyIconWrapper } from "./copy-components";

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
