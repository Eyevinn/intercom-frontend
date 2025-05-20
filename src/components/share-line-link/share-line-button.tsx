import styled from "@emotion/styled";
import { useState } from "react";
import { ShareIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";
import { ShareLineLinkModal } from "./share-line-link-modal";
import { useShareUrl } from "../../hooks/use-share-url";

type TShareLineBtnProps = {
  isMinified?: boolean;
  productionId: string;
  lineId: string;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ShareButton = styled(PrimaryButton)`
  cursor: pointer;
  padding: 1rem;
  z-index: 1;
  width: fit-content;
  margin-top: 1rem;
  justify-self: flex-end;
`;

const IconWrapper = styled.div`
  width: 2rem;
  height: 2rem;
  margin-right: ${({ isMinified }: { isMinified: boolean }) =>
    isMinified ? "0" : "1rem"};

  svg {
    fill: #482307;
  }
`;

export const ShareLineButton = ({
  isMinified,
  productionId,
  lineId,
}: TShareLineBtnProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { shareUrl, url } = useShareUrl();

  return (
    <div>
      <ShareButton
        onClick={() => {
          shareUrl({ productionId, lineId });
          setIsModalOpen(true);
        }}
      >
        <Wrapper>
          <IconWrapper isMinified={isMinified || false}>
            <ShareIcon />
          </IconWrapper>
          {!isMinified && "Share Line"}
        </Wrapper>
      </ShareButton>
      {isModalOpen && (
        <ShareLineLinkModal
          urls={[url]}
          onRefresh={() => shareUrl({ productionId, lineId })}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
