import { isMobile } from "../../../bowser";
import { GenerateUrlButton } from "../generate-url-button";
import { GenerateWhepUrlModal } from "./generate-whep-url-modal";

export const GenerateWhepUrlButton = ({
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
        return "WHEP";
      } else {
        return "WHEP URL";
      }
    } else {
      return "Get WHEP URL";
    }
  };

  return (
    <GenerateUrlButton
      isMinified={isMinified}
      label={renderButtonLabel()}
      modalContent={(onClose) => (
        <GenerateWhepUrlModal
          productionId={productionId}
          lineId={lineId}
          onClose={onClose}
        />
      )}
    />
  );
};
