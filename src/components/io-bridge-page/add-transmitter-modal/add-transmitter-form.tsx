import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import {
  BoldHeader,
  BoldText,
  Collapsible,
  FieldHeader,
  FormWrapper,
  SubmitButton,
} from "../io-bridge-components";
import { FormItem } from "../../user-settings-form/form-item";
import {
  DecorativeLabel,
  FormInput,
  FormSelect,
} from "../../form-elements/form-elements";
import { useFetchProductionList } from "../../landing-page/use-fetch-production-list";
import { TLine } from "../../production-line/types";
import { ButtonWrapper } from "../../generic-components";
import { useCreateTransmitter } from "../../../hooks/use-create-transmitter";
import { useSubmitOnEnter } from "../../../hooks/use-submit-form-enter-press";
import { SpinnerWrapper } from "../../delete-button/delete-button-components";
import { Spinner } from "../../loader/loader";

type FormValues = {
  label?: string;
  port: number;
  mode: "caller" | "listener";
  srtUrl?: string;
  productionId: number;
  lineId: number;
  passThroughUrl?: string;
  whipUsername: string;
  status: "idle" | "running" | "stopped" | "failed";
};

type AddTransmitterFormProps = {
  onSave?: () => void;
};

export const AddTransmitterForm = ({ onSave }: AddTransmitterFormProps) => {
  const srtModeOptions = ["caller", "listener"];
  const [createTransmitter, setCreateTransmitter] = useState<FormValues | null>(
    null
  );
  const {
    formState: { errors },
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
  } = useForm<FormValues>({
    resetOptions: { keepDirtyValues: true, keepErrors: true },
    defaultValues: { mode: "listener" },
  });

  const { productions } = useFetchProductionList({ extended: "true" });
  const { loading, success } = useCreateTransmitter({ createTransmitter });
  const mode = useWatch({ control, name: "mode" });

  useEffect(() => {
    if (mode === "caller") {
      setValue("port", 0);
      clearErrors("port");
      clearErrors("srtUrl");
    } else {
      setValue("srtUrl", "");
      clearErrors("srtUrl");
      clearErrors("port");
    }
  }, [mode, setValue, clearErrors]);

  useEffect(() => {
    if (success) {
      setCreateTransmitter(null);
      if (onSave) onSave();
    }
  }, [success, onSave]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setCreateTransmitter(data);
  };

  useSubmitOnEnter<FormValues>({
    handleSubmit,
    submitHandler: onSubmit,
    shouldSubmitOnEnter: true,
  });

  const selectedProductionId = useWatch({ control, name: "productionId" });

  const selectedProduction = useMemo(() => {
    const list = productions?.productions ?? [];
    return list.find(
      (p) => String(p.productionId) === String(selectedProductionId)
    );
  }, [productions, selectedProductionId]);

  const lines = selectedProduction?.lines;

  useEffect(() => {
    const list = productions?.productions ?? [];
    if (!list.length) return;
    if (!selectedProductionId) {
      setValue("productionId", Number(list[0].productionId), {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [productions, selectedProductionId, setValue]);

  useEffect(() => {
    if (lines && lines[0]) {
      setValue("lineId", Number(lines[0].id), {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [lines, setValue]);

  return (
    <>
      <BoldHeader> Add SRT to WHIP transmitter</BoldHeader>
      <FormWrapper>
        <FormItem fieldName="label" errors={errors}>
          <FieldHeader>
            <BoldText>Label</BoldText>(Optional)
          </FieldHeader>
          <FormInput
            // eslint-disable-next-line
            {...register("label", {
              minLength: 1,
            })}
            placeholder="Label for transmitter"
          />
        </FormItem>

        <FormItem fieldName="productionId" errors={errors}>
          <BoldText>Production</BoldText>
          {productions?.productions?.length ? (
            <FormSelect
              required
              // eslint-disable-next-line
              {...register("productionId", {
                required: "Production is required",
                setValueAs: (v) => Number(v),
              })}
            >
              {productions.productions.map((p) => (
                <option key={p.productionId} value={String(p.productionId)}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
          ) : (
            <DecorativeLabel>No productions available</DecorativeLabel>
          )}
        </FormItem>

        <FormItem fieldName="lineId" errors={errors}>
          <BoldText>Line</BoldText>
          <FormSelect
            // eslint-disable-next-line
            {...register("lineId", {
              required: "Line is required",
              setValueAs: (v) => Number(v),
            })}
            disabled={!selectedProductionId || !lines}
          >
            {!lines ? (
              <option value="">There are no lines in this production</option>
            ) : (
              lines.map((line: TLine) => (
                <option
                  key={String(line.id ?? line.id)}
                  value={String(line.id ?? line.id)}
                >
                  {line.name ?? line.name ?? `Line ${line.id ?? line.id}`}
                </option>
              ))
            )}
          </FormSelect>
        </FormItem>

        <FormItem fieldName="whipUsername" errors={errors}>
          <BoldText>WHIP Username</BoldText>
          <FormInput
            // eslint-disable-next-line
            {...register("whipUsername", {
              required: "WHIP username",
              minLength: 1,
            })}
            placeholder="Username for the WHIP stream"
          />
        </FormItem>

        <FormItem fieldName="mode" errors={errors}>
          <BoldText>SRT Mode</BoldText>
          <FormSelect
            // eslint-disable-next-line
            {...register("mode", {
              required: "SRT Mode",
              minLength: 1,
            })}
            defaultValue="listener"
          >
            {srtModeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </FormSelect>
        </FormItem>

        <Collapsible
          open={mode === "listener"}
          aria-hidden={mode !== "listener"}
        >
          <div>
            <FormItem fieldName="port" errors={errors}>
              <BoldText>SRT Port (Local)</BoldText>
              <FormInput
                type="number"
                // eslint-disable-next-line
                {...register("port", {
                  validate: (v) =>
                    mode !== "listener" ||
                    (v && v > 0) ||
                    "SRT Port is required in Listener mode",
                  valueAsNumber: true,
                })}
                placeholder="SRT Port"
                disabled={mode !== "listener"}
                tabIndex={mode === "listener" ? 0 : -1}
              />
            </FormItem>
          </div>
        </Collapsible>

        <Collapsible open={mode === "caller"} aria-hidden={mode !== "caller"}>
          <div>
            <FormItem fieldName="srtUrl" errors={errors}>
              <BoldText>SRT Destination URL</BoldText>
              <FormInput
                // eslint-disable-next-line
                {...register("srtUrl", {
                  validate: (v) =>
                    mode !== "caller" ||
                    (v && v.length > 0) ||
                    "SRT URL is required in Caller mode (e.g., srt://host:port)",
                  setValueAs: (v) => {
                    // Add srt:// prefix if user didn't specify it
                    if (v && !v.startsWith("srt://")) {
                      return `srt://${v}`;
                    }
                    return v;
                  },
                })}
                placeholder="srt://host:port"
                disabled={mode !== "caller"}
                tabIndex={mode === "caller" ? 0 : -1}
              />
            </FormItem>
          </div>
        </Collapsible>

        <FormItem fieldName="passThroughUrl" errors={errors}>
          <FieldHeader>
            <BoldText>SRT Restream URL</BoldText> (Optional)
          </FieldHeader>
          <FormInput
            // eslint-disable-next-line
            {...register("passThroughUrl")}
          />
        </FormItem>

        <ButtonWrapper>
          <SubmitButton
            type="button"
            // disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
            shouldSubmitOnEnter
          >
            Add Transmitter
            {loading && (
              <SpinnerWrapper>
                <Spinner className="production-list" />
              </SpinnerWrapper>
            )}
          </SubmitButton>
        </ButtonWrapper>
      </FormWrapper>
    </>
  );
};
