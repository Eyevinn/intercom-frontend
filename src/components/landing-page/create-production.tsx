import { DisplayContainerHeader } from "./display-container-header.tsx";
import {
  DecorativeLabel,
  FormContainer,
  FormInput,
  FormLabel,
  SubmitButton,
} from "./form-elements.tsx";

export const CreateProduction = () => {
  return (
    <FormContainer>
      <DisplayContainerHeader>Create Production</DisplayContainerHeader>
      <FormLabel>
        <DecorativeLabel>Production Name</DecorativeLabel>
        <FormInput type="text" value="" placeholder="Production Name" />
      </FormLabel>
      <FormLabel>
        <DecorativeLabel>Line</DecorativeLabel>
        <FormInput type="text" value="Editorial" placeholder="Line Name" />
      </FormLabel>
      <FormLabel>
        <DecorativeLabel>Line</DecorativeLabel>
        <FormInput type="text" value="Production" placeholder="Line Name" />
      </FormLabel>
      <SubmitButton type="submit">Create Production</SubmitButton>
    </FormContainer>
  );
};
