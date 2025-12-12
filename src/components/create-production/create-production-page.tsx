import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { useEffect, useState } from "react";
import { DisplayContainerHeader } from "../landing-page/display-container-header.tsx";
import { FormInput } from "../form-elements/form-elements.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import {
  ListItemWrapper,
  ResponsiveFormContainer,
} from "../generic-components.ts";
import { RemoveLineButton } from "../remove-line-button/remove-line-button.tsx";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button.tsx";
import { isMobile } from "../../bowser.ts";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { FormValues, useCreateProduction } from "./use-create-production.tsx";
import {
  HeaderWrapper,
  CheckboxWrapper,
  ProductionConfirmation,
  FetchErrorMessage,
} from "./create-production-components.ts";
import { FormItem } from "../user-settings-form/form-item.tsx";
import { CreateProductionButtons } from "./create-production-buttons.tsx";
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

  const validateLineNameUniqueness = (defaultLineValue: string) => {
    const normalizedDefault = normalizeLineName(defaultLineValue);

    return (value: string) => {
      const normalized = normalizeLineName(value);

      return (
        !normalizedDefault ||
        normalized !== normalizedDefault ||
        "Line name must be unique within this production"
      );
    };
  };

  const lineNameValidator = validateLineNameUniqueness(defaultLine);

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
      return;
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
      >
        <FormInput
          // eslint-disable-next-line
          {...register(`productionName`, {
            required: "Production name is required",
            minLength: 1,
          })}
          autoComplete="off"
          placeholder="Production Name"
        />
      </FormItem>
      <FormItem label="Line" fieldName="defaultLine" errors={errors}>
        <FormInput
          // eslint-disable-next-line
          {...register(`defaultLine`, lineNameRequiredValidation)}
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
      </FormItem>
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormItem
            label="Line"
            fieldName={`lines.${index}.name`}
            errors={errors}
          >
            <ListItemWrapper>
              <>
                <FormInput
                  // eslint-disable-next-line
                  {...register(`lines.${index}.name`, {
                    ...lineNameRequiredValidation,
                    validate: lineNameValidator,
                  })}
                  className={
                    index === fields.length - 1 ? "additional-line" : ""
                  }
                  autoComplete="off"
                  placeholder="Line Name"
                />
                {index === fields.length - 1 && (
                  <RemoveLineButton
                    isCreatingLine
                    removeLine={() => remove(index)}
                  />
                )}
              </>
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
            </ListItemWrapper>
          </FormItem>
        </div>
      ))}
      <CreateProductionButtons
        loading={loading}
        handleAddLine={() => append({ name: "" })}
        handleSubmit={handleSubmit(onSubmit)}
        isAddLineDisabled={hasDuplicateWithDefaultLine}
        isCreateDisabled={hasDuplicateWithDefaultLine}
      />
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
