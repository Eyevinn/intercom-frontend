import styled from "@emotion/styled";
import React from "react";
import { ActionButton } from "../form-elements/form-elements";

const RemoveBtn = styled(ActionButton)<{ shouldSubmitOnEnter?: boolean }>`
  cursor: pointer;
  padding: 1rem;
  background: #d15c5c;
  color: white;
  z-index: 1;
  outline: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px solid #007bff" : "none"};
  outline-offset: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px" : "0"};

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
  shouldSubmitOnEnter?: boolean;
};

export const RemoveButton = ({
  onClick,
  type,
  children,
  disabled,
  className,
  shouldSubmitOnEnter,
}: TRemoveButton) => {
  return (
    <RemoveBtn
      type={type}
      disabled={disabled}
      className={className}
      shouldSubmitOnEnter={shouldSubmitOnEnter}
      onClick={onClick}
    >
      {children}
    </RemoveBtn>
  );
};
