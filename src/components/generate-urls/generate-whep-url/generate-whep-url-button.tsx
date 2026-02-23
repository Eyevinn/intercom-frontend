import { useCallback } from "react";
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
      }
      return "WHEP URL";
    }
    return "Get WHEP URL";
  };

  const renderModalContent = useCallback(
    (onClose: () => void) => (
      <GenerateWhepUrlModal
        productionId={productionId}
        lineId={lineId}
        onClose={onClose}
      />
    ),
    [productionId, lineId]
  );

  return (
    <GenerateUrlButton
      isMinified={isMinified}
      label={renderButtonLabel()}
      modalContent={renderModalContent}
    />
  );
};
