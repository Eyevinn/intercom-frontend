import { DisplayContainerHeader } from "./display-container-header.tsx";
import {
  DecorativeLabel,
  FormLabel,
  FormContainer,
  FormInput,
  FormSelect,
  SubmitButton,
} from "./form-elements.tsx";

export const JoinProduction = () => {
  return (
    <FormContainer>
      <DisplayContainerHeader>Join Production</DisplayContainerHeader>
      <FormLabel>
        <DecorativeLabel>Production ID</DecorativeLabel>
        <FormInput type="text" placeholder="Production ID" value="" />
      </FormLabel>
      <FormLabel>
        <DecorativeLabel>Username</DecorativeLabel>
        <FormInput type="text" placeholder="Username" value="" />
      </FormLabel>
      <FormLabel>
        <DecorativeLabel>Input</DecorativeLabel>
        <FormSelect>
          <option>Mic 1</option>
          <option>Mic 2</option>
        </FormSelect>
      </FormLabel>
      <FormLabel>
        <DecorativeLabel>Output</DecorativeLabel>
        <FormSelect>
          <option>Speaker 1</option>
          <option>Speaker 2</option>
        </FormSelect>
      </FormLabel>

      <FormLabel>
        <DecorativeLabel>Line</DecorativeLabel>
        <FormSelect>
          <option>Line 1</option>
          <option>Line 2</option>
        </FormSelect>
      </FormLabel>

      <SubmitButton type="submit">Join</SubmitButton>
    </FormContainer>
  );
};
