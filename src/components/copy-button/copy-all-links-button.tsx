import styled from "@emotion/styled";
import { PrimaryButton } from "../landing-page/form-elements";
import { useCopyLinks } from "./use-copy-links";
import { TProduction } from "../production-line/types";
import { CheckIcon } from "../../assets/icons/icon";

const CopyToClipboardWrapper = styled.div<{
  flexDirection: "row" | "row-reverse";
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
  align-items: center;

  svg {
    width: 4rem;
    height: 4rem;
    padding: 1rem 0 1rem 0;
    fill: #76e859;
  }
`;

export const CopyAllLinksButton = ({
  production,
  flexDirection,
}: {
  production: TProduction;
  flexDirection: "row" | "row-reverse";
}) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  return (
    <CopyToClipboardWrapper flexDirection={flexDirection}>
      <PrimaryButton
        type="button"
        onClick={() =>
          handleCopyUrlToClipboard(
            production.lines.map((item) => {
              return ` ${item.name}: ${window.location.origin}/production-calls/production/${production.productionId}/line/${item.id}`;
            })
          )
        }
        disabled={isCopied}
      >
        Copy Links
      </PrimaryButton>
      {isCopied && <CheckIcon />}
    </CopyToClipboardWrapper>
  );
};
