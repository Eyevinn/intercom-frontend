import { PrimaryButton } from "../landing-page/form-elements";
import { useCopyLinks } from "./use-copy-links";
import { TProduction } from "../production-line/types";
import { CheckIcon } from "../../assets/icons/icon";
import { useShareUrl } from "../../hooks/use-share-url";
import {
  CopyToClipboardWrapper,
  ButtonWrapper,
  NoteTextBold,
  NoteTextItalic,
  NoteWrapper,
} from "./copy-components";

export const CopyAllLinksButton = ({
  production,
  className,
}: {
  production: TProduction;
  className: string;
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();
  const { shareUrl } = useShareUrl();

  const handleCopy = async () => {
    const urls = await Promise.all(
      production.lines.map(async (item) => {
        const generatedUrl = await shareUrl({
          productionId: production.productionId,
          lineId: item.id,
        });
        return ` ${item.name}: ${generatedUrl}`;
      })
    );
    handleCopyUrlToClipboard(urls);
  };

  return (
    <CopyToClipboardWrapper>
      <NoteWrapper>
        <NoteTextBold>Note:</NoteTextBold>
        <NoteTextItalic>
          Each link can only be used once. Press button again to generate new
          links.
        </NoteTextItalic>
      </NoteWrapper>
      <ButtonWrapper className={className}>
        <PrimaryButton type="button" onClick={handleCopy} disabled={isCopied}>
          Copy Links
        </PrimaryButton>
        {isCopied && <CheckIcon />}
      </ButtonWrapper>
    </CopyToClipboardWrapper>
  );
};
