import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ErrorMessage } from "@hookform/error-message";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import {
  DecorativeLabel,
  FormContainer,
  FormInput,
  FormLabel,
  StyledWarningMessage,
  ActionButton,
} from "./form-elements.tsx";
import { API } from "../../api/api.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";

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
  const [, dispatch] = useGlobalState();
  const [createdProductionId, setCreatedProductionId] = useState<string | null>(
    null
  );
  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
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
      .catch((error) => {
        dispatch({
          type: "ERROR",
          payload: error,
        });
      });
  };

  // Reset form values when created production id changes
  useEffect(() => {
    if (createdProductionId) {
      reset({
        productionName: "",
        defaultLine: "",
        lines: [],
      });
    }
  }, [createdProductionId, reset]);

  return (
    <FormContainer>
      <DisplayContainerHeader>Create Production</DisplayContainerHeader>
      <FormLabel>
        <DecorativeLabel>Production Name</DecorativeLabel>
        <FormInput
          // eslint-disable-next-line
          {...register(`productionName`, {
            required: "Production name is required",
            minLength: 1,
          })}
          placeholder="Production Name"
        />
      </FormLabel>
      <ErrorMessage
        errors={errors}
        name="productionName"
        as={StyledWarningMessage}
      />
      <FormLabel>
        <DecorativeLabel>Line</DecorativeLabel>
        <FormInput
          // eslint-disable-next-line
          {...register(`defaultLine`, {
            required: "Line name is required",
            minLength: 1,
          })}
          type="text"
          placeholder="Line Name"
        />
      </FormLabel>
      <ErrorMessage
        errors={errors}
        name="defaultLine"
        as={StyledWarningMessage}
      />
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormLabel>
            <DecorativeLabel>Line</DecorativeLabel>
            <FormInput
              // eslint-disable-next-line
              {...register(`lines.${index}.name`, {
                required: "Line name is required",
                minLength: 1,
              })}
              type="text"
              placeholder="Line Name"
            />
          </FormLabel>
          <ErrorMessage
            errors={errors}
            name={`lines.${index}.name`}
            as={StyledWarningMessage}
          />
        </div>
      ))}
      <ActionButton type="button" onClick={() => append({ name: "" })}>
        Add Line
      </ActionButton>

      <ActionButton type="submit" onClick={handleSubmit(onSubmit)}>
        Create Production
      </ActionButton>
      {createdProductionId !== null && (
        <ProductionConfirmation>
          The production ID is: {createdProductionId.toString()}
        </ProductionConfirmation>
      )}
    </FormContainer>
  );
};
