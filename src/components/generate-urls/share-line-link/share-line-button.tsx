import { ShareIcon } from "../../../assets/icons/icon";
import { useShareUrl } from "../../../hooks/use-share-url";
import { ModalButton } from "../../ui-components/buttons/modal-button";
import { ShareLineLinkModal } from "../share-line-link/share-line-link-modal";

export const ShareLineButton = ({
  productionId,
  lineId,
}: {
  productionId: string;
  lineId: string;
}) => {
  const { shareUrl, url } = useShareUrl();

  return (
    <ModalButton
      icon={<ShareIcon />}
      onClick={() => shareUrl({ productionId, lineId })}
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
