import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import {
  BoldHeader,
  BoldText,
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
import { useCreateReceiver } from "../../../hooks/use-create-receiver";
import { useSubmitOnEnter } from "../../../hooks/use-submit-form-enter-press";
import { SpinnerWrapper } from "../../delete-button/delete-button-components";
import { Spinner } from "../../loader/loader";

type FormValues = {
  label?: string;
  productionId: number;
  lineId: number;
  whepUsername: string;
  srtUrl: string;
};

type AddReceiverFormProps = {
  onSave?: () => void;
};

export const AddReceiverForm = ({ onSave }: AddReceiverFormProps) => {
  const [createReceiver, setCreateReceiver] = useState<FormValues | null>(null);
  const {
    formState: { errors },
    register,
    handleSubmit,
    control,
    setValue,
  } = useForm<FormValues>({
    resetOptions: { keepDirtyValues: true, keepErrors: true },
  });

  const { productions } = useFetchProductionList({ extended: "true" });
  const { loading, success } = useCreateReceiver({ createReceiver });

  useEffect(() => {
    if (success) {
      setCreateReceiver(null);
      if (onSave) onSave();
    }
  }, [success, onSave]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setCreateReceiver(data);
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
      <BoldHeader> Add WHEP to SRT receiver</BoldHeader>
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
            placeholder="Label for receiver"
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

        <FormItem fieldName="whepUsername" errors={errors}>
          <BoldText>WHEP Username</BoldText>
          <FormInput
            // eslint-disable-next-line
            {...register("whepUsername", {
              required: "WHEP username",
              minLength: 1,
            })}
            placeholder="Username for the WHEP stream"
          />
        </FormItem>

        <FormItem fieldName="srtUrl" errors={errors}>
          <BoldText>SRT Output URL</BoldText>
          <FormInput
            // eslint-disable-next-line
            {...register("srtUrl", {
              required: "SRT Output URL is required",
              minLength: 1,
            })}
            placeholder="srt://hostname:port"
          />
          <div
            style={{
              marginTop: "4px",
              fontSize: "12px",
              color: "#999",
              lineHeight: "1.4",
            }}
          >
            Default SRT mode is caller.<br></br>
            SRT Listener URL example: srt://0.0.0.0:10000?mode=listener
          </div>
        </FormItem>

        <ButtonWrapper>
          <SubmitButton
            type="button"
            onClick={handleSubmit(onSubmit)}
            shouldSubmitOnEnter
          >
            Add Receiver
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
