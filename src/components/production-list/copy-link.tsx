import { useCallback, useState } from "react";
import { TBasicProductionResponse } from "../../api/api";
import { ShareIcon } from "../../assets/icons/icon";
import { useShareUrl } from "../../hooks/use-share-url";
import { CopyIconWrapper } from "../copy-button/copy-components";
import { ShareLineLinkModal } from "../generate-urls/share-line-link/share-line-link-modal";
import { TLine } from "../production-line/types";

export const CopyLink = ({
  production,
  line,
  isCopyProduction = false,
}: {
  production: TBasicProductionResponse;
  line: TLine;
  isCopyProduction?: boolean;
}) => {
  const [productionUrls, setProductionUrls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { shareUrl, url } = useShareUrl();

  const handleGenerateProductionUrls = useCallback(async () => {
    const urls = await Promise.all(
      production.lines.map(async (item) => {
        const generatedUrl = await shareUrl({
          productionId: production.productionId,
          lineId: item.id,
        });
        return ` ${item.name}: ${generatedUrl}`;
      })
    );
    setProductionUrls(urls);
  }, [production.productionId, production.lines, shareUrl]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCopyProduction) {
      handleGenerateProductionUrls();
    } else {
      shareUrl({
        productionId: production.productionId,
        lineId: line.id,
      });
    }
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    if (isCopyProduction) {
      handleGenerateProductionUrls();
    } else {
      shareUrl({
        productionId: production.productionId,
        lineId: line.id,
      });
    }
  };

  return (
    <>
      <CopyIconWrapper
        title="Get share link"
        onClick={handleClick}
        className="production-list-item"
      >
        <ShareIcon />
      </CopyIconWrapper>
      {isModalOpen && (
        <ShareLineLinkModal
          isCopyProduction={isCopyProduction}
          urls={isCopyProduction ? productionUrls : [url]}
          onRefresh={handleRefresh}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
