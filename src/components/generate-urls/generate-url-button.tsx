import styled from "@emotion/styled";
import { ReactNode, useState } from "react";
import { isMobile } from "../../bowser";
import { PrimaryButton } from "../form-elements/form-elements";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const GenerateButton = styled(PrimaryButton)<{ isMinified: boolean }>`
  cursor: pointer;
  padding: ${({ isMinified }: { isMinified: boolean }) =>
    isMinified && isMobile ? "0.5rem 1rem" : "0.5rem 1rem"};
  z-index: 1;
  width: fit-content;
  margin-top: 1rem;
  justify-self: flex-end;
  height: ${({ isMinified }) => (isMinified ? "4.5rem" : "auto")};
  min-height: 3.5rem;
  display: flex;
  align-items: center;
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
      <GenerateButton isMinified={isMinified} onClick={handleClick}>
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
