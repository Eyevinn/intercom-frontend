import styled from "@emotion/styled";
import { ActionButton, FormInput } from "../form-elements/form-elements";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background: #383838;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 80%;
  max-width: 40rem;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.2);
  color: white;
`;

export const ModalHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
`;

export const ModalHeader = styled.h2`
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
`;

export const ModalCloseButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 2.5rem;
    fill: #f96c6c;
  }

  &:hover svg {
    fill: #c44c4c;
  }
`;

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
