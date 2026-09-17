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

  const handleGenerateProductionUrls = useCallback(
    async (guest: boolean) => {
      const urls = await Promise.all(
        production.lines.map(async (item) => {
          const generatedUrl = await shareUrl({
            productionId: production.productionId,
            lineId: item.id,
            guest,
          });
          return ` ${item.name}: ${generatedUrl}`;
        })
      );
      setProductionUrls(urls);
    },
    [production.productionId, production.lines, shareUrl]
  );

  const generate = (guest: boolean) => {
    if (isCopyProduction) {
      handleGenerateProductionUrls(guest);
    } else {
      shareUrl({
        productionId: production.productionId,
        lineId: line.id,
        guest,
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    generate(false);
    setIsModalOpen(true);
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
          onRefresh={({ guest }) => generate(guest)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
