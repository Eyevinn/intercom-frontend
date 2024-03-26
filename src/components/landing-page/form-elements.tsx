import styled from "@emotion/styled";

export const FormContainer = styled.div``;

export const FormInput = styled.input`
  width: 100%;
`;

export const FormSelect = styled.select`
  width: 100%;
`;

export const FormLabel = styled.label`
  display: block;
  padding: 0 0 1rem;
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

export const SubmitButton = styled.button`
  font-size: 1.6rem;
  padding: 1rem;
  display: block;
  margin: 0 0 2rem 0;
`;
