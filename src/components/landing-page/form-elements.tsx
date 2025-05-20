import styled from "@emotion/styled";

export const FormContainer = styled.form``;

const sharedMargin = `margin: 0 0 2rem`;

export const FormInput = styled.input`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.75rem;
  margin: 0 0 2rem;
  border: 0.1rem solid #6d6d6d;
  border-radius: 0.5rem;
  background: #32383b;
  color: white;

  ${sharedMargin};

  &.additional-line {
    padding-right: 3.5rem;
  }

  &.with-loader {
    padding-right: 3.5rem;

    &::-webkit-inner-spin-button {
      appearance: none;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type="number"] {
      -moz-appearance: textfield;
    }
  }

  &.edit-name {
    margin: 0;
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.5rem;
  ${sharedMargin};
  border: 1px solid #6d6d6d;
  border-radius: 0.5rem;
  background: #32383b;
  color: white;
`;

export const FormLabel = styled.label`
  display: block;
  input,
  select {
    font-size: 1.6rem;
    display: inline-block;
  }

  &.save-edit {
    margin-right: 1rem;
  }
`;

export const DecorativeLabel = styled.span`
  display: block;
  white-space: nowrap;
  padding: 0 1rem 1rem 0;
`;

export const StyledWarningMessage = styled.div`
  padding: 0.5rem;
  font-size: 1.6rem;
  background: #ebca6a;
  border-radius: 0.5rem;
  color: #1a1a1a;
  ${sharedMargin};
  border: 1px solid #ebca6a;
  display: flex;
  align-items: center;

  &.error-message {
    background: #f96c6c;
    border: 1px solid #f96c6c;
  }

  &.production-list {
    margin: 1rem 0;
  }
`;

export const ActionButton = styled.button`
  background: #1db954;
  border: 0 solid #e5e7eb;
  border-radius: 0.5rem;
  box-sizing: border-box;
  color: #482307;
  column-gap: 1rem;
  cursor: pointer;
  display: flex;
  font-size: 100%;
  font-weight: 700;
  line-height: 2.4rem;
  margin: 0;
  outline: 0.2rem solid transparent;
  padding: 1rem 1.5rem;
  text-align: center;
  text-transform: none;
  transform: translateZ(0) scale(1);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  box-shadow:
    -0.6rem 0.8rem 1rem rgba(81, 41, 10, 0.1),
    0 0.2rem 0.2rem rgba(81, 41, 10, 0.2);

  &:disabled {
    background: #1db954;
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.with-loader {
    position: relative;
    color: rgba(255, 255, 255, 0);
  }
`;

export const PrimaryButton = styled(ActionButton)`
  background: rgba(89, 203, 232, 1);
  &:active:enabled {
    transform: translateY(0.125rem);
  }

  &:not(:disabled):hover {
  }

  &:not(:disabled):hover:active {
    transform: translateY(0.125rem);
  }

  &:focus {
    outline: 0 solid transparent;
  }

  &:focus:before {
    content: "";
    left: calc(-1 * 0.375rem);
    pointer-events: none;
    position: absolute;
    top: calc(-1 * 0.375rem);
    transition: border-radius;
    user-select: none;
  }

  &:focus:not(:focus-visible) {
    outline: 0 solid transparent;
  }

  &:focus:not(:focus-visible):before {
    border-width: 0;
  }

  &:not(:disabled):active {
    transform: translateY(0.125rem);
  }

  &:disabled {
    background: rgba(89, 203, 232, 0.5);
  }
`;

export const SecondaryButton = styled(ActionButton)`
  background: white;
  &:before,
  &:after {
    border-radius: 0.5rem;
  }

  &:before {
    content: "";
    display: block;
    height: 100%;
    left: 0;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -2;
  }

  &:after {
    content: "";
    display: block;
    overflow: hidden;
    position: absolute;
    right: 0.4rem;
    top: 0.4rem;
    left: 0.4rem;
    bottom: 0.4rem;
    transition: all 100ms ease-out;
    z-index: -1;
  }

  &:hover:not(:disabled):after {
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    transition-timing-function: ease-in;
  }

  &:active:not(:disabled) {
    color: #ccc;
  }

  &:active:not(:disabled):after {
    background-image: linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.2),
        rgba(0, 0, 0, 0.2)
      ),
      linear-gradient(92.83deg, #fff, #f8eedb, 100%);
    bottom: 0.4rem;
    left: 0.4rem;
    right: 0.4rem;
    top: 0.4rem;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.8);
  }
`;
