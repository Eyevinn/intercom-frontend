import { WhipIcon } from "../../../assets/icons/icon";
import { GenerateUrlButton } from "../generate-url-button";
import { GenerateWhipUrlModal } from "./generate-whip-url-modal";

export const GenerateWhipUrlButton = ({
  productionId,
  lineId,
}: {
  isMinified?: boolean;
  productionId: string;
  lineId: string;
}) => {
  return (
    <GenerateUrlButton
      icon={<WhipIcon />}
      className="whip-button"
      modalContent={(onClose) => (
        <GenerateWhipUrlModal
          productionId={productionId}
          lineId={lineId}
          onClose={onClose}
        />
      )}
    />
  );
};
