import { useState, useCallback } from "react";
import { ShareIcon } from "../../assets/icons/icon";
import { useShareUrl } from "../../hooks/use-share-url";
import { ShareLineLinkModal } from "../share-line-link/share-line-link-modal";
import { TLine } from "../production-line/types";
import { TBasicProductionResponse } from "../../api/api";
import { CopyIconWrapper } from "../copy-button/copy-components";

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

  return (
    <>
      <CopyIconWrapper
        title="Get share link"
        onClick={(e) => {
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
        }}
        className="production-list-item"
      >
        <ShareIcon />
      </CopyIconWrapper>
      {isModalOpen && (
        <ShareLineLinkModal
          isCopyProduction={isCopyProduction}
          urls={isCopyProduction ? productionUrls : [url]}
          onRefresh={() => {
            if (isCopyProduction) {
              handleGenerateProductionUrls();
            } else {
              shareUrl({
                productionId: production.productionId,
                lineId: line.id,
              });
            }
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
