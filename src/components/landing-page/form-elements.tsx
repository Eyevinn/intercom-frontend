import styled from "@emotion/styled";

export const FormContainer = styled.form``;

export const FormInput = styled.input`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.5rem;
  margin: 0 0 1rem;
  border: 1px solid #6f6e6e;
  border-radius: 0.5rem;

  &.additional-line {
    padding-right: 3.5rem;
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.5rem;
  margin: 0 0 1rem;
  border: 1px solid #6f6e6e;
  border-radius: 0.5rem;
`;

export const FormLabel = styled.label`
  display: block;
  input,
  select {
    font-size: 1.6rem;
    display: inline-block;
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
  margin: 0 0 1rem;
  border: 1px solid #ebca6a;
  display: flex;
  align-items: center;

  &.with-loader {
    min-width: 27rem;
  }
`;

const ActionButton = styled.button`
  background-color: transparent;
  background-image: linear-gradient(to bottom, #fff, #f8eedb);
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
  margin: 1rem;
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
    background: #c9c6c0;
    cursor: not-allowed;
  }

  &.with-loader {
    position: relative;
    color: rgba(255, 255, 255, 0);
  }
`;

export const PrimaryButton = styled(ActionButton)`
  &:active {
    background-color: #f3f4f6;
    box-shadow:
      -0.1rem 0.2rem 0.5rem rgba(81, 41, 10, 0.15),
      0 0.1rem 0.1rem rgba(81, 41, 10, 0.15);
    transform: translateY(0.125rem);
  }

  &:focus {
    box-shadow:
      rgba(72, 35, 7, 0.46) 0 0 0 0.4rem,
      -0.6rem 0.8rem 1rem rgba(81, 41, 10, 0.1),
      0 0.2rem 0.2rem rgba(81, 41, 10, 0.2);
  }

  &:not(:disabled):hover {
    transform: scale(1.05);
  }

  &:not(:disabled):hover:active {
    transform: scale(1.05) translateY(0.125rem);
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
`;

export const SecondaryButton = styled(ActionButton)`
  &:before,
  &:after {
    border-radius: 0.5rem;
  }

  &:before {
    background-color: rgba(72, 54, 42, 0.32);
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
    background-color: initial;
    background-image: linear-gradient(to bottom, #fff, #f5ead6);
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
`;
