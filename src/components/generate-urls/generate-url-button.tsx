import styled from "@emotion/styled";
import { ReactNode, useState } from "react";
import { FooterButton } from "../production-line/exit-call-button";

const IconWrapper = styled.div`
  svg {
    fill: rgb(89, 203, 232);
  }
`;

type TGenerateUrlButtonProps = {
  icon?: ReactNode;
  modalContent: (onClose: () => void) => ReactNode;
  onClick?: () => void;
  className?: string;
};

export const GenerateUrlButton = ({
  icon,
  modalContent,
  onClick,
  className,
}: TGenerateUrlButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    console.log("handleClick");
    onClick?.();
    setIsModalOpen(true);
  };

  return (
    <FooterButton onClick={handleClick} className={className}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {isModalOpen && modalContent(() => setIsModalOpen(false))}
    </FooterButton>
  );
};
