import styled from "@emotion/styled";

export const FormContainer = styled.div``;

export const FormInput = styled.input`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.5rem;
  margin: 0 0 1rem;
  border: 1px solid #6f6e6e;
  border-radius: 0.5rem;
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

export const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.87);
  color: #1a1a1a;
  font-weight: bold;
  border-radius: 0.5rem;
  border: none;
  font-size: 1.6rem;
  padding: 1rem;
  display: block;
  margin: 0 0 2rem 0;

  &:hover {
    cursor: pointer;
  }
`;

export const StyledWarningMessage = styled.div`
  padding: 0.5rem;
  font-size: 1.6rem;
  background: #ebca6a;
  border-radius: 0.5rem;
  color: #1a1a1a;
  margin: 0 0 1rem;
  border: 1px solid #ebca6a;
`;
