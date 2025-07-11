import styled from "@emotion/styled";
import { ReactNode, useState } from "react";
import { PrimaryButton } from "../form-elements/form-elements";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const GenerateButton = styled(PrimaryButton)`
  cursor: pointer;
  padding: 1rem;
  z-index: 1;
  width: fit-content;
  margin-top: 1rem;
  justify-self: flex-end;
`;

const IconWrapper = styled.div`
  width: 2rem;
  height: 2rem;
  margin-right: ${({ isMinified }: { isMinified: boolean }) =>
    isMinified ? "0" : "1rem"};

  svg {
    fill: #482307;
  }
`;

type TGenerateUrlButtonProps = {
  isMinified?: boolean;
  label: string;
  icon?: ReactNode;
  isShareLine?: boolean;
  modalContent: (onClose: () => void) => ReactNode;
  onClick?: () => void;
};

export const GenerateUrlButton = ({
  isMinified = false,
  isShareLine,
  label,
  icon,
  modalContent,
  onClick,
}: TGenerateUrlButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    onClick?.();
    setIsModalOpen(true);
  };

  return (
    <div>
      <GenerateButton onClick={handleClick}>
        <Wrapper>
          {icon && <IconWrapper isMinified={isMinified}>{icon}</IconWrapper>}
          {!isMinified && isShareLine && label}
          {!isShareLine && label}
        </Wrapper>
      </GenerateButton>
      {isModalOpen && modalContent(() => setIsModalOpen(false))}
    </div>
  );
};
