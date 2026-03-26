import styled from "@emotion/styled";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect, useState } from "react";
import {
  FormInput,
  PrimaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { RemoveLineButton } from "../remove-line-button/remove-line-button.tsx";
import { useFetchProduction } from "../landing-page/use-fetch-production.ts";
import { isMobile } from "../../bowser.ts";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { AddIcon } from "../../assets/icons/icon.tsx";
import { FormValues, useCreateProduction } from "./use-create-production.tsx";
import {
  CheckboxWrapper,
  ProductionConfirmation,
  FetchErrorMessage,
  LineCard,
  LineCardHeader,
  LineNumber,
  AddLineCard,
  LineInputRow,
  CreateButtonWrapper,
  SelectInput,
  SectionDivider,
  SectionHeader,
  TwoColumnLayout,
} from "./create-production-components.ts";
import { FormItem } from "../user-settings-form/form-item.tsx";
import { InfoTooltip } from "../info-tooltip/info-tooltip.tsx";
import { Spinner } from "../loader/loader.tsx";
import {
  normalizeLineName,
  useHasDuplicateLineName,
} from "../../hooks/use-has-duplicate-line-name.ts";
import { usePresetContext } from "../../contexts/preset-context";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list.ts";
import { PageHeader } from "../page-layout/page-header.tsx";

type PresetFormValues = {
  presetName: string;
  calls: { productionId: string; lineId: string }[];
};

const VisibilityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CompanionInputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CompanionPrefix = styled.span`
  position: absolute;
  left: 1.2rem;
  font-size: 1.4rem;
  line-height: 1rem;
  color: #9aa3ab;
  pointer-events: none;
`;

const CompanionHostPortInput = styled(FormInput)`
  padding-left: calc(2rem + 3.5ch);
  margin: 0;
`;

const RadioOption = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: ${({ active }) => (active ? "600" : "400")};
  color: ${({ active }) =>
    active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)"};
  transition: color 0.15s;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const RadioDot = styled.span<{ active: boolean }>`
  position: relative;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 0.2rem solid
    ${({ active }) =>
      active ? "rgba(89, 203, 232, 1)" : "rgba(255,255,255,0.3)"};
  background: transparent;
  flex-shrink: 0;
  transition: border-color 0.15s;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    background: rgba(89, 203, 232, 1);
    opacity: ${({ active }) => (active ? 1 : 0)};
    transition: opacity 0.15s;
  }
`;

const isValidHostPort = (input: string): boolean => {
  const pattern = /^([a-zA-Z0-9.-]+|\[[\da-fA-F:]+\])(:\d{1,5})?$/;
  return pattern.test(input);
};

const PRODUCTION_LIST_FILTER = { limit: "30", extended: "true" };

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
    clearErrors,
  } = useForm<FormValues>({
    mode: "onSubmit",
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
    const populated: `lines.${number}.name`[] = [];
    const empty: `lines.${number}.name`[] = [];

    fields.forEach((_, i) => {
      const field = `lines.${i}.name` as `lines.${number}.name`;
      if (lines?.[i]?.name?.trim()) {
        populated.push(field);
      } else {
        empty.push(field);
      }
    });

    if (empty.length > 0) {
      clearErrors(empty);
    }
    if (populated.length > 0) {
      Promise.all(
        populated.map((field) => trigger(field, { shouldFocus: false }))
      );
    }
  }, [defaultLine, lines, trigger, clearErrors, fields]);

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

  // Preset form
  const [showPresetConfirmation, setShowPresetConfirmation] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const [isLocalPreset, setIsLocalPreset] = useState(false);
  const [companionEnabled, setCompanionEnabled] = useState(false);
  const [companionHostPort, setCompanionHostPort] = useState("");
  const { createLocalPreset, createPublicPreset } = usePresetContext();

  const handleCompanionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.trim();
    if (v.startsWith("ws://")) v = v.slice(5);
    else if (v.startsWith("wss://")) v = v.slice(6);
    setCompanionHostPort(v);
  };

  const companionUrl = companionHostPort.trim()
    ? `ws://${companionHostPort.trim()}`
    : undefined;

  const isCompanionValid =
    !companionEnabled ||
    companionHostPort === "" ||
    isValidHostPort(companionHostPort);
  const {
    register: registerPreset,
    handleSubmit: handleSubmitPreset,
    control: presetControl,
    reset: resetPreset,
    formState: { errors: presetErrors },
    watch: watchPreset,
    trigger: triggerPreset,
    clearErrors: clearPresetErrors,
  } = useForm<PresetFormValues>({
    mode: "onChange",
    defaultValues: {
      presetName: "",
      calls: [{ productionId: "", lineId: "" }],
    },
  });

  const {
    fields: callFields,
    append: appendCall,
    remove: removeCall,
  } = useFieldArray({
    control: presetControl,
    name: "calls",
  });

  const presetCalls = watchPreset("calls");

  const hasDuplicateCall =
    presetCalls?.some(
      (call, i) =>
        call.productionId &&
        call.lineId &&
        presetCalls.some(
          (other, j) =>
            j !== i &&
            other.productionId === call.productionId &&
            other.lineId === call.lineId
        )
    ) ?? false;

  const validateNoDuplicateCall = (index: number) => (lineId: string) => {
    if (!lineId) return true;
    const currentProductionId = presetCalls?.[index]?.productionId;
    if (!currentProductionId) return true;
    const isDuplicate = presetCalls?.some(
      (other, j) =>
        j !== index &&
        other.productionId === currentProductionId &&
        other.lineId === lineId
    );
    return isDuplicate
      ? "This line is already in the saved configuration."
      : true;
  };

  useEffect(() => {
    if (!presetCalls) return;
    const populated: `calls.${number}.lineId`[] = [];
    const empty: `calls.${number}.lineId`[] = [];
    callFields.forEach((_, i) => {
      const field = `calls.${i}.lineId` as `calls.${number}.lineId`;
      if (presetCalls?.[i]?.lineId) {
        populated.push(field);
      } else {
        empty.push(field);
      }
    });
    if (empty.length > 0) clearPresetErrors(empty);
    if (populated.length > 0) {
      Promise.all(
        populated.map((field) => triggerPreset(field, { shouldFocus: false }))
      );
    }
  }, [presetCalls, callFields, triggerPreset, clearPresetErrors]);

  const { productions: productionList } = useFetchProductionList(
    PRODUCTION_LIST_FILTER
  );

  const onSubmitPreset: SubmitHandler<PresetFormValues> = async (
    presetData
  ) => {
    setPresetLoading(true);
    try {
      if (isLocalPreset) {
        createLocalPreset(
          presetData.presetName,
          presetData.calls,
          companionUrl
        );
      } else {
        await createPublicPreset({
          name: presetData.presetName,
          calls: presetData.calls,
          companionUrl,
        });
      }
      resetPreset({
        presetName: "",
        calls: [{ productionId: "", lineId: "" }],
      });
      setShowPresetConfirmation(true);
      setTimeout(() => setShowPresetConfirmation(false), 4000);
    } finally {
      setPresetLoading(false);
    }
  };

  const productionForm = (
    <>
      <SectionHeader>
        Production
        <InfoTooltip>
          A <strong>production</strong> is a named group of communication lines
        </InfoTooltip>
      </SectionHeader>
      <FormItem
        label="Name"
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
                <InfoTooltip>
                  In an <strong>Audio Feed</strong> line, listeners are not able
                  to talk. Only the <strong>Audio Feed</strong> will be heard.
                </InfoTooltip>
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
                  <InfoTooltip>
                    In an <strong>Audio Feed</strong> line, listeners are not
                    able to talk. Only the <strong>Audio Feed</strong> will be
                    heard.
                  </InfoTooltip>
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
    </>
  );

  const presetForm = (
    <>
      <SectionHeader>
        Saved Configuration
        <InfoTooltip>
          A <strong>saved configuration</strong> is a saved combination of lines
          you can join with one click. Deleting a line removes it from any saved
          configurations it belongs to.
        </InfoTooltip>
      </SectionHeader>
      <VisibilityRow>
        <RadioOption
          type="button"
          active={!isLocalPreset}
          onClick={() => setIsLocalPreset(false)}
        >
          <RadioDot active={!isLocalPreset} />
          Public
        </RadioOption>
        <RadioOption
          type="button"
          active={isLocalPreset}
          onClick={() => setIsLocalPreset(true)}
        >
          <RadioDot active={isLocalPreset} />
          Local
        </RadioOption>
        <InfoTooltip>
          <strong>Public</strong> saved configurations are stored on the server
          and visible to everyone.
          <br />
          <strong>Local</strong> saved configurations are stored in your browser
          only — not visible to others, but can still be shared via URL.
        </InfoTooltip>
      </VisibilityRow>
      <VisibilityRow>
        <RadioOption
          type="button"
          active={companionEnabled}
          onClick={() => {
            setCompanionEnabled(!companionEnabled);
            if (companionEnabled) setCompanionHostPort("");
          }}
        >
          <RadioDot active={companionEnabled} />
          Auto-connect to Companion
        </RadioOption>
        <InfoTooltip>
          Automatically connect to <strong>Bitfocus Companion</strong> when
          joining this saved configuration. Companion lets you control your{" "}
          <strong>Stream Deck</strong> and other button panels via WebSocket.
          Enter your local Companion server address to enable this.
        </InfoTooltip>
      </VisibilityRow>
      {companionEnabled && (
        <>
          <CompanionInputGroup>
            <CompanionPrefix aria-hidden="true">ws://</CompanionPrefix>
            <CompanionHostPortInput
              id="create-companion-url"
              aria-label="Companion WebSocket host and port"
              type="text"
              placeholder="localhost:12345"
              value={companionHostPort}
              onChange={handleCompanionChange}
            />
          </CompanionInputGroup>
          {companionHostPort !== "" && !isValidHostPort(companionHostPort) && (
            <StyledWarningMessage role="alert">
              Enter a valid host:port (e.g. localhost:12345)
            </StyledWarningMessage>
          )}
        </>
      )}
      <FormItem
        label="Name"
        fieldName="presetName"
        errors={presetErrors}
        errorStyle={{ marginTop: "5px", marginBottom: 0 }}
      >
        <FormInput
          // eslint-disable-next-line
          {...registerPreset("presetName", {
            required: "Configuration name is required",
            minLength: 1,
          })}
          autoComplete="off"
          placeholder="Configuration name"
          style={{ marginBottom: 0 }}
        />
      </FormItem>
      {callFields.map((field, index) => (
        <LineCard key={field.id} style={{ marginTop: "1.5rem" }}>
          <LineCardHeader>
            <LineNumber>Line {index + 1}</LineNumber>
            {index > 0 && (
              <RemoveLineButton removeLine={() => removeCall(index)} />
            )}
          </LineCardHeader>
          <SelectInput
            // eslint-disable-next-line
            {...registerPreset(`calls.${index}.productionId`, {
              required: "Production is required",
            })}
          >
            <option value="">Select production…</option>
            {productionList?.productions.map((p) => (
              <option key={p.productionId} value={p.productionId}>
                {p.name}
              </option>
            ))}
          </SelectInput>
          {presetErrors.calls?.[index]?.productionId && (
            <StyledWarningMessage style={{ marginTop: "0.5rem" }}>
              {presetErrors.calls[index].productionId?.message}
            </StyledWarningMessage>
          )}
          <SelectInput
            // eslint-disable-next-line
            {...registerPreset(`calls.${index}.lineId`, {
              required: "Line is required",
              validate: validateNoDuplicateCall(index),
            })}
            disabled={!presetCalls?.[index]?.productionId}
            style={{ marginBottom: 0 }}
          >
            <option value="">Select line…</option>
            {productionList?.productions
              .find(
                (p) => p.productionId === presetCalls?.[index]?.productionId
              )
              ?.lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
          </SelectInput>
          <ErrorMessage
            errors={presetErrors}
            name={`calls.${index}.lineId`}
            as={<StyledWarningMessage style={{ marginTop: "0.5rem" }} />}
          />
        </LineCard>
      ))}
      <AddLineCard
        type="button"
        onClick={() => appendCall({ productionId: "", lineId: "" })}
        disabled={hasDuplicateCall}
      >
        <AddIcon />
        Add Line
      </AddLineCard>
      {showPresetConfirmation && (
        <ProductionConfirmation>
          Saved configuration has been created.
        </ProductionConfirmation>
      )}
      <CreateButtonWrapper>
        <PrimaryButton
          type="submit"
          className={presetLoading ? "with-loader" : ""}
          onClick={handleSubmitPreset(onSubmitPreset)}
          disabled={presetLoading || hasDuplicateCall || !isCompanionValid}
        >
          Create saved configuration
          {presetLoading && <Spinner className="create-preset" />}
        </PrimaryButton>
      </CreateButtonWrapper>
    </>
  );

  if (isMobile) {
    return (
      <>
        <PageHeader title="Create" hasNavigateToRoot />
        <div style={{ padding: "0 2rem" }}>
          {productionForm}
          <SectionDivider />
          {presetForm}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Create" hasNavigateToRoot />
      <TwoColumnLayout>
        <div>{productionForm}</div>
        <div>{presetForm}</div>
      </TwoColumnLayout>
    </>
  );
};
