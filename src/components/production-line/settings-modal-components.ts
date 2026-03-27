import styled from "@emotion/styled";
import { ActionButton, FormInput } from "../form-elements/form-elements";

export const CancelButton = styled(ActionButton)`
  background: #d6d3d1;

  &:disabled {
    background: rgba(214, 211, 209, 0.8);
  }
`;

export const ButtonDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const HotkeyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

export const HotkeyLabel = styled.span`
  white-space: nowrap;
  font-size: 1.4rem;
`;

export const HotkeyLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`;

export const HotkeyWarningWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;

  svg {
    width: 1.6rem;
    height: 1.6rem;
    fill: #ebca6a;
  }

  &:hover .hotkey-tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

export const HotkeyTooltip = styled.span`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 130%;
  left: 0;
  background: #32383b;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  white-space: normal;
  width: 20rem;
  border: 0.1rem solid #6d6d6d;
  z-index: 20;
  transition: opacity 0.15s ease;
  pointer-events: none;
`;

export const HotkeyInput = styled(FormInput)`
  width: 6rem;
  margin: 0;
  text-align: center;
  flex-shrink: 0;
`;
