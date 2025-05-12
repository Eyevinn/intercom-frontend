import styled from "@emotion/styled";
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
import { Spinner } from "../loader/loader";

const CopyButton = styled(PrimaryButton)`
  min-width: 12rem;
  min-height: 4.5rem;
`;

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
          Each link can only be used once. Press the button again to generate
          new links.
        </NoteTextItalic>
      </NoteWrapper>
      <ButtonWrapper className={className}>
        <CopyButton type="button" onClick={handleCopy} disabled={isCopied}>
          {isCopied ? <Spinner className="copy-button" /> : "Copy Links"}
        </CopyButton>
        {isCopied && <CheckIcon />}
      </ButtonWrapper>
    </CopyToClipboardWrapper>
  );
};
