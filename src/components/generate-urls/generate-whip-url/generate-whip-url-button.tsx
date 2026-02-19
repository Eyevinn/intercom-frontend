import { useCallback } from "react";
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
        return "WHIP";
      }
      return "WHIP URL";
    }
    return "Get WHIP URL";
  };

  const renderModalContent = useCallback(
    (onClose: () => void) => (
      <GenerateWhipUrlModal
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
