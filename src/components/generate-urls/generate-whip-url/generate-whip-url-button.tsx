import { isMobile } from "../../../bowser";
import { GenerateUrlButton } from "../generate-url-button";
import { GenerateWhipUrlModal } from "./generate-whip-url-modal";

export const GenerateWhipUrlButton = ({
  isMinified,
  productionId,
  lineId,
}: {
  isMinified?: boolean;
  productionId: string;
  lineId: string;
}) => {
  const renderButtonLabel = () => {
    if (isMinified) {
      if (isMobile) {
        return "Whip";
      } else {
        return "Whip URL";
      }
    } else {
      return "Get Whip URL";
    }
  };

  return (
    <GenerateUrlButton
      isMinified={isMinified}
      label={renderButtonLabel()}
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
