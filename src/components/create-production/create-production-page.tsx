import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ErrorMessage } from "@hookform/error-message";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import {
  DecorativeLabel,
  FormInput,
  FormLabel,
  StyledWarningMessage,
  PrimaryButton,
  SecondaryButton,
} from "../landing-page/form-elements.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { Spinner } from "../loader/loader.tsx";
import { FlexContainer } from "../generic-components.ts";
import { RemoveLineButton } from "../remove-line-button/remove-line-button.tsx";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button.tsx";
import { ResponsiveFormContainer } from "../user-settings/user-settings.tsx";
import { isMobile } from "../../bowser.ts";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { FormValues, useCreateProduction } from "./use-create-production.tsx";
import { CopyAllLinksButton } from "../copy-button/copy-all-links-button.tsx";

const HeaderWrapper = styled.div`
  display: flex;
  margin-bottom: 2rem;
  align-items: center;
  h2 {
    margin: 0;
    margin-left: 1rem;
  }
`;

export const ListItemWrapper = styled.div`
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin: 0 1rem 1rem 0;
  :last-of-type {
    margin: 0 0 1rem;
  }
`;

const ProductionConfirmation = styled.div`
  background: #91fa8c;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b2ffa1;
  color: #1a1a1a;
`;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 1rem 0;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 3rem;
`;

export const CreateProductionPage = () => {
  const [, dispatch] = useGlobalState();
  const [createNewProduction, setCreateNewProduction] =
    useState<FormValues | null>(null);
  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      productionName: "",
      defaultLine: "",
      defaultLineProgramOutput: false,
      lines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
    rules: {
      minLength: 1,
    },
  });

  const { createdProductionId, loading } = useCreateProduction({
    createNewProduction,
  });

  const { error: productionFetchError, production } = useFetchProduction(
    createdProductionId ? parseInt(createdProductionId, 10) : null
  );

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    setCreateNewProduction(value);
  };

  // Reset form values when created production id changes
  useEffect(() => {
    if (createdProductionId) {
      reset({
        productionName: "",
        defaultLine: "",
        lines: [],
      });
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
  }, [createdProductionId, dispatch, reset]);

  return (
    <ResponsiveFormContainer className={isMobile ? "" : "desktop"}>
      <HeaderWrapper>
        <NavigateToRootButton />
        <DisplayContainerHeader>Create Production</DisplayContainerHeader>
      </HeaderWrapper>
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
        <Controller
          name="defaultLineProgramOutput"
          control={control}
          render={({ field }) => (
            <CheckboxWrapper>
              <Checkbox
                label="This line will be used for an audio feed"
                checked={field.value || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(e.target.checked)
                }
              />
            </CheckboxWrapper>
          )}
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
                className={index === fields.length - 1 ? "additional-line" : ""}
                autoComplete="off"
                placeholder="Line Name"
              />
              <Controller
                name={`lines.${index}.programOutputLine`}
                control={control}
                render={({ field: controllerField }) => (
                  <CheckboxWrapper>
                    <Checkbox
                      label="This line will be used for an audio feed"
                      checked={controllerField.value || false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        controllerField.onChange(e.target.checked)
                      }
                    />
                  </CheckboxWrapper>
                )}
              />
              {index === fields.length - 1 && (
                <RemoveLineButton
                  isCreatingLine
                  removeLine={() => remove(index)}
                />
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
      <FlexContainer>
        <ButtonWrapper>
          <SecondaryButton type="button" onClick={() => append({ name: "" })}>
            Add Line
          </SecondaryButton>
        </ButtonWrapper>
        <ButtonWrapper>
          <PrimaryButton
            type="submit"
            className={loading ? "with-loader" : ""}
            onClick={handleSubmit(onSubmit)}
          >
            Create Production
            {loading && <Spinner className="create-production" />}
          </PrimaryButton>
        </ButtonWrapper>
      </FlexContainer>
      {createdProductionId !== null && (
        <>
          <ProductionConfirmation>
            The production ID is: {createdProductionId.toString()}
          </ProductionConfirmation>
          {!productionFetchError && production && (
            <CopyAllLinksButton
              production={production}
              className="create-production-page"
            />
          )}
          {productionFetchError && (
            <FetchErrorMessage>
              The production information could not be fetched, not able to copy
              to clipboard.
            </FetchErrorMessage>
          )}
        </>
      )}
    </ResponsiveFormContainer>
  );
};
