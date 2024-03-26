import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useState } from "react";
import styled from "@emotion/styled";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import {
  DecorativeLabel,
  FormContainer,
  FormInput,
  FormLabel,
  SubmitButton,
} from "./form-elements.tsx";
import { API } from "../../api/api.ts";

type FormValues = {
  productionName: string;
  defaultLine: string;
  lines: { name: string }[];
};

const ProductionConfirmation = styled.div`
  background: #91fa8c;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b2ffa1;
  color: #1a1a1a;
`;
export const CreateProduction = () => {
  const [createdProductionId, setCreatedProductionId] = useState<string | null>(
    null
  );
  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
  } = useForm<FormValues>();
  const { fields, append } = useFieldArray({
    control,
    name: "lines",
    rules: {
      minLength: 1,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    API.createProduction({
      name: value.productionName,
      lines: [{ name: value.defaultLine }, ...value.lines],
    })
      .then((v) => setCreatedProductionId(v.productionid))
      .catch((e) => {
        console.error(e);
        // TODO error handling, display error in form or in global header?
      });
  };

  return (
    <FormContainer>
      <DisplayContainerHeader>Create Production</DisplayContainerHeader>
      <FormLabel>
        <DecorativeLabel>Production Name</DecorativeLabel>
        <FormInput
          // eslint-disable-next-line
          {...register(`productionName`, { minLength: 1 })}
          placeholder="Production Name"
        />
      </FormLabel>
      {errors.productionName && <div>BAD INPUT</div>}
      <FormLabel>
        <DecorativeLabel>Line</DecorativeLabel>
        <FormInput
          // eslint-disable-next-line
          {...register(`defaultLine`, { minLength: 1 })}
          type="text"
          value="Editorial"
          placeholder="Line Name"
        />
      </FormLabel>
      {fields.map((field, index) => (
        <FormLabel key={field.id}>
          <DecorativeLabel>Line</DecorativeLabel>
          <FormInput
            // eslint-disable-next-line
            {...register(`lines.${index}.name`)}
            type="text"
          />
        </FormLabel>
      ))}
      <SubmitButton type="button" onClick={() => append({ name: "" })}>
        Add Line
      </SubmitButton>

      <SubmitButton type="submit" onClick={handleSubmit(onSubmit)}>
        Create Production
      </SubmitButton>
      {createdProductionId !== null && (
        <ProductionConfirmation>
          The production ID is: {createdProductionId.toString()}
        </ProductionConfirmation>
      )}
    </FormContainer>
  );
};
