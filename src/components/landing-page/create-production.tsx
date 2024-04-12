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
import { Spinner } from "../loader/loader.tsx";
import { isMobile } from "../../bowser.ts";
import { RemoveLine } from "../../assets/icons/icon.tsx";

type FormValues = {
  productionName: string;
  defaultLine: string;
  lines: { name: string }[];
};

const RemoveLineBtn = styled.button`
  cursor: pointer;
  position: absolute;
  top: -0.7rem;
  right: -0.5rem;
  padding: 1rem;
  background: transparent;
  border: transparent;
`;

const ListItemWrapper = styled.div`
  position: relative;
`;

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
  const [loading, setLoading] = useState<boolean>(false);
  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
    rules: {
      minLength: 1,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    setLoading(true);
    API.createProduction({
      name: value.productionName,
      lines: [{ name: value.defaultLine }, ...value.lines],
    })
      .then((v) => {
        setCreatedProductionId(v.productionid);
        setLoading(false);
      })
      .catch((error) => {
        dispatch({
          type: "ERROR",
          payload: error,
        });
        setLoading(false);
      });
  };

  // Reset form values when created production id changes
  useEffect(() => {
    // TODO remove this after testing
    console.log(`Is this a mobile? "${isMobile}"`);
    if (createdProductionId) {
      reset({
        productionName: "",
        defaultLine: "",
        lines: [],
      });
      dispatch({
        type: "PRODUCTION_CREATED",
      });
    }
  }, [createdProductionId, dispatch, reset]);

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
          autoComplete="off"
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
          autoComplete="off"
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
            <ListItemWrapper>
              <FormInput
                // eslint-disable-next-line
                {...register(`lines.${index}.name`, {
                  required: "Line name is required",
                  minLength: 1,
                })}
                className="additional-line"
                autoComplete="off"
                placeholder="Line Name"
              />
              {index === fields.length - 1 && (
                <RemoveLineBtn type="button" onClick={() => remove(index)}>
                  <RemoveLine />
                </RemoveLineBtn>
              )}
            </ListItemWrapper>
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

      <ActionButton
        type="submit"
        className={loading ? "submit" : ""}
        onClick={handleSubmit(onSubmit)}
      >
        Create Production
        {loading && <Spinner className="create-production" />}
      </ActionButton>
      {createdProductionId !== null && (
        <ProductionConfirmation>
          The production ID is: {createdProductionId.toString()}
        </ProductionConfirmation>
      )}
    </FormContainer>
  );
};
