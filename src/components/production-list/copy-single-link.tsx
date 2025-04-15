import { useState } from "react";
import { ShareIcon } from "../../assets/icons/icon";
import { useShareUrl } from "../../hooks/use-share-url";
import { ShareLineLinkModal } from "../production-line/share-line-link-modal";
import { TLine } from "../production-line/types";
import { TBasicProductionResponse } from "../../api/api";
import { CopyIconWrapper } from "../copy-button/copy-components";

export const CopySingleLink = ({
  production,
  line,
}: {
  production: TBasicProductionResponse;
  line: TLine;
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { shareUrl, url } = useShareUrl();
  return (
    <>
      <CopyIconWrapper
        title="Get share link"
        onClick={() => {
          shareUrl({
            productionId: production.productionId,
            lineId: line.id,
          });
          setIsModalOpen(true);
        }}
        className="production-list-item"
      >
        <ShareIcon />
      </CopyIconWrapper>
      {isModalOpen && (
        <ShareLineLinkModal
          url={url}
          onRefresh={() =>
            shareUrl({
              productionId: production.productionId,
              lineId: line.id,
            })
          }
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
