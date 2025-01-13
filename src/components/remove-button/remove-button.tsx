import React from "react";
import styled from "@emotion/styled";
import { ActionButton } from "../landing-page/form-elements";

const RemoveBtn = styled(ActionButton)`
  cursor: pointer;
  padding: 1rem;
  background: #d15c5c;
  color: white;
  z-index: 1;

  &:active:enabled {
    background: #ab5252;
  }

  &:disabled {
    background: rgba(220, 38, 38, 0.8);
  }
`;

type TRemoveButton = {
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const RemoveButton = ({
  onClick,
  type,
  children,
  disabled,
  className,
}: TRemoveButton) => {
  return (
    <RemoveBtn
      type={type}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {children}
    </RemoveBtn>
  );
};
