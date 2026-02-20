import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect, useState } from "react";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import {
  FormInput,
  PrimaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { ResponsiveFormContainer } from "../generic-components.ts";
import { RemoveLineButton } from "../remove-line-button/remove-line-button.tsx";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button.tsx";
import { isMobile } from "../../bowser.ts";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { AddIcon } from "../../assets/icons/icon.tsx";
import { FormValues, useCreateProduction } from "./use-create-production.tsx";
import {
  HeaderWrapper,
  CheckboxWrapper,
  ProductionConfirmation,
  FetchErrorMessage,
  LineCard,
  LineCardHeader,
  LineNumber,
  AddLineCard,
  LineInputRow,
  TooltipWrapper,
  TooltipContent,
  CreateButtonWrapper,
} from "./create-production-components.ts";
import { FormItem } from "../user-settings-form/form-item.tsx";
import { Spinner } from "../loader/loader.tsx";
import {
  normalizeLineName,
  useHasDuplicateLineName,
} from "../../hooks/use-has-duplicate-line-name.ts";

export const CreateProductionPage = () => {
  const [, dispatch] = useGlobalState();
  const [createNewProduction, setCreateNewProduction] =
    useState<FormValues | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
    trigger,
  } = useForm<FormValues>({
    mode: "onTouched",
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

  const defaultLine = useWatch({ control, name: "defaultLine" });
  const lines = useWatch({ control, name: "lines" });

  const lineNameRequiredValidation = {
    required: "Line name is required",
    minLength: 1,
  };

  const hasDuplicateWithDefaultLine = useHasDuplicateLineName({
    candidateName: defaultLine,
    lines,
  });

  const validateLineNameUniqueness = (index: number) => {
    return (value: string) => {
      const normalized = normalizeLineName(value);
      if (!normalized) return true;

      const normalizedDefault = normalizeLineName(defaultLine);
      if (normalizedDefault && normalized === normalizedDefault) {
        return "Line name must be unique within this production";
      }

      const hasDuplicateInLines = lines?.some(
        (line, i) => i !== index && normalizeLineName(line.name) === normalized
      );
      if (hasDuplicateInLines) {
        return "Line name must be unique within this production";
      }

      return true;
    };
  };

  useEffect(() => {
    const fieldsToValidate = fields
      .map((_, i) => (lines?.[i]?.name ? `lines.${i}.name` : null))
      .filter((field): field is `lines.${number}.name` => Boolean(field));

    if (fieldsToValidate.length > 0) {
      Promise.all(
        fieldsToValidate.map((field) => trigger(field, { shouldFocus: false }))
      );
    }
  }, [defaultLine, lines, trigger, fields]);

  const { loading, success, data } = useCreateProduction({
    createNewProduction,
  });

  const { error: productionFetchError } = useFetchProduction(
    data?.productionId ? parseInt(data.productionId, 10) : null
  );

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    setCreateNewProduction(value);
  };

  // Reset form values when created production id changes
  useEffect(() => {
    if (data?.productionId) {
      reset({
        productionName: "",
        defaultLine: "",
        lines: [],
      });
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
  }, [data?.productionId, dispatch, reset]);

  // Auto-hide confirmation after a short delay
  useEffect(() => {
    if (!success || !data?.name) {
      setShowConfirmation(false);
      return undefined;
    }

    setShowConfirmation(true);
    const id = setTimeout(() => setShowConfirmation(false), 4000);
    return () => clearTimeout(id);
  }, [success, data?.name]);

  return (
    <ResponsiveFormContainer className={isMobile ? "" : "desktop"}>
      <HeaderWrapper>
        <NavigateToRootButton />
        <DisplayContainerHeader>Create Production</DisplayContainerHeader>
      </HeaderWrapper>
      <FormItem
        label="Production Name"
        fieldName="productionName"
        errors={errors}
        errorStyle={{ marginTop: "5px", marginBottom: 0 }}
      >
        <FormInput
          // eslint-disable-next-line
          {...register(`productionName`, {
            required: "Production name is required",
            minLength: 1,
          })}
          autoComplete="off"
          placeholder="Production Name"
          style={{ marginBottom: 0 }}
        />
      </FormItem>
      <LineCard style={{ marginTop: "1.5rem" }}>
        <LineCardHeader>
          <LineNumber>Line 1</LineNumber>
        </LineCardHeader>
        <LineInputRow>
          <FormItem>
            <FormInput
              // eslint-disable-next-line
              {...register(`defaultLine`, lineNameRequiredValidation)}
              autoComplete="off"
              placeholder="Line Name"
            />
          </FormItem>
          <Controller
            name="defaultLineProgramOutput"
            control={control}
            render={({ field }) => (
              <CheckboxWrapper>
                <Checkbox
                  label="Audio Feed"
                  checked={field.value || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                />
                <TooltipWrapper>
                  ⓘ
                  <TooltipContent className="tooltip-content">
                    In an <strong>Audio Feed</strong> line, listeners are not
                    able to talk. Only the <strong>Audio Feed</strong> will be
                    heard.
                  </TooltipContent>
                </TooltipWrapper>
              </CheckboxWrapper>
            )}
          />
        </LineInputRow>
        <ErrorMessage
          errors={errors}
          name="defaultLine"
          as={<StyledWarningMessage style={{ marginTop: "0.5rem" }} />}
        />
      </LineCard>
      {fields.map((field, index) => (
        <LineCard key={field.id}>
          <LineCardHeader>
            <LineNumber>Line {index + 2}</LineNumber>
            <RemoveLineButton removeLine={() => remove(index)} />
          </LineCardHeader>
          <LineInputRow>
            <FormItem>
              <FormInput
                // eslint-disable-next-line
                {...register(`lines.${index}.name`, {
                  ...lineNameRequiredValidation,
                  validate: validateLineNameUniqueness(index),
                })}
                autoComplete="off"
                placeholder="Line Name"
              />
            </FormItem>
            <Controller
              name={`lines.${index}.programOutputLine`}
              control={control}
              render={({ field: controllerField }) => (
                <CheckboxWrapper>
                  <Checkbox
                    label="Audio Feed"
                    checked={controllerField.value || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      controllerField.onChange(e.target.checked)
                    }
                  />
                  <TooltipWrapper>
                    ⓘ
                    <TooltipContent className="tooltip-content">
                      In an <strong>Audio Feed</strong> line, listeners are not
                      able to talk. Only the <strong>Audio Feed</strong> will be
                      heard.
                    </TooltipContent>
                  </TooltipWrapper>
                </CheckboxWrapper>
              )}
            />
          </LineInputRow>
          <ErrorMessage
            errors={errors}
            name={`lines.${index}.name`}
            as={<StyledWarningMessage style={{ marginTop: "0.5rem" }} />}
          />
        </LineCard>
      ))}
      <AddLineCard
        type="button"
        onClick={() => append({ name: "" })}
        disabled={hasDuplicateWithDefaultLine}
      >
        <AddIcon />
        Add Line
      </AddLineCard>
      <CreateButtonWrapper>
        <PrimaryButton
          type="submit"
          className={loading ? "with-loader" : ""}
          onClick={handleSubmit(onSubmit)}
          disabled={hasDuplicateWithDefaultLine}
        >
          Create Production
          {loading && <Spinner className="create-production" />}
        </PrimaryButton>
      </CreateButtonWrapper>
      {showConfirmation && data?.name && (
        <>
          <ProductionConfirmation>
            The production <strong>{data.name}</strong> has been created.
          </ProductionConfirmation>

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
