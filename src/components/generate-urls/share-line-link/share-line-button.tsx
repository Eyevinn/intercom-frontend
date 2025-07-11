import { ShareIcon } from "../../../assets/icons/icon";
import { useShareUrl } from "../../../hooks/use-share-url";
import { GenerateUrlButton } from "../generate-url-button";
import { ShareLineLinkModal } from "../share-line-link/share-line-link-modal";

export const ShareLineButton = ({
  isMinified,
  productionId,
  lineId,
}: {
  isMinified?: boolean;
  productionId: string;
  lineId: string;
}) => {
  const { shareUrl, url } = useShareUrl();

  return (
    <GenerateUrlButton
      isMinified={isMinified}
      label="Share Line"
      icon={<ShareIcon />}
      onClick={() => shareUrl({ productionId, lineId })}
      isShareLine
      modalContent={(onClose) => (
        <ShareLineLinkModal
          urls={[url]}
          onRefresh={() => shareUrl({ productionId, lineId })}
          onClose={onClose}
        />
      )}
    />
  );
};
