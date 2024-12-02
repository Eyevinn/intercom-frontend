import React from "react";
import styled from "@emotion/styled";
import { ActionButton } from "../landing-page/form-elements";

const RemoveBtn = styled(ActionButton)`
  cursor: pointer;
  padding: 1rem;
  background: #dc2626;
  color: white;
  z-index: 1;

  &:active:enabled {
    background: #990f0f;
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
