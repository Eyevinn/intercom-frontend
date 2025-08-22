import styled from "@emotion/styled";
import { ReactNode, useState } from "react";
import { PrimaryButton } from "../../form-elements/form-elements";

export const ModalButtonWrapper = styled(PrimaryButton)`
  margin-top: 1rem;
  background: rgba(50, 56, 59, 1);
  color: white;
  border: 0.2rem solid #6d6d6d;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;

  svg {
    width: 2.5rem;
    height: 2.5rem;
    fill: rgb(89, 203, 232);
  }

  &.hotkeys-button {
    svg {
      fill: #c4c4c4;
    }
  }

  &.whip-button {
    svg {
      fill: #b589fe;
    }
  }

  &.exit-call-button {
    svg {
      fill: #f96c6c;
    }
  }
`;

const IconWrapper = styled.div``;

const LabelWrapper = styled.div``;

type TModalButtonProps = {
  label?: string;
  icon?: ReactNode;
  modalContent: (onClose: () => void) => ReactNode;
  onClick?: () => void;
  className?: string;
};

export const ModalButton = ({
  label,
  icon,
  modalContent,
  onClick,
  className,
}: TModalButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick?.();
    setIsModalOpen(true);
  };

  return (
    <>
      <ModalButtonWrapper onClick={handleClick} className={className}>
        {label && <LabelWrapper>{label}</LabelWrapper>}
        {icon && <IconWrapper>{icon}</IconWrapper>}
      </ModalButtonWrapper>
      {isModalOpen && modalContent(() => setIsModalOpen(false))}
    </>
  );
};
