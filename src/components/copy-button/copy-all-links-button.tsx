import styled from "@emotion/styled";
import { PrimaryButton } from "../landing-page/form-elements";
import { useCopyLinks } from "./use-copy-links";
import { TProduction } from "../production-line/types";
import { CheckIcon } from "../../assets/icons/icon";

const CopyToClipboardWrapper = styled.div`
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

export const CopyAllLinksButton = ({
  production,
  className,
}: {
  production: TProduction;
  className: string;
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  const handleCopy = () => {
    handleCopyUrlToClipboard(
      production.lines.map((item) => {
        return ` ${item.name}: ${window.location.origin}/production-calls/production/${production.productionId}/line/${item.id}`;
      })
    );
  };

  return (
    <CopyToClipboardWrapper className={className}>
      <PrimaryButton type="button" onClick={handleCopy} disabled={isCopied}>
        Copy Links
      </PrimaryButton>
      {isCopied && <CheckIcon />}
    </CopyToClipboardWrapper>
  );
};
